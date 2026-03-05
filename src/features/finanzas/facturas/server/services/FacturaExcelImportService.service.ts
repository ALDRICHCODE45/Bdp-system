import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import { Result, Err, Ok } from "@/core/shared/result/result";
import {
  ImportFacturaExcelRowDto,
  ValidatedExcelRowDto,
} from "../dtos/ImportFacturaExcelRowDto.dto";
import {
  ImportExcelPreviewDto,
  DuplicadaDto,
  ErrorValidacionDto,
  ImportOptionsDto,
  FieldChange,
} from "../dtos/ImportExcelPreviewDto.dto";
import {
  ImportFacturaResultDto,
  ImportExecutionResultDto,
} from "../dtos/ImportFacturaResultDto.dto";
import {
  importFacturaExcelRowSchema,
  COLUMN_ALIASES,
  REQUIRED_FIELDS,
  FIELD_TO_LABEL,
  normalizeColumnHeader,
} from "../validators/importFacturaExcelRowSchema";
import { FacturaRepository } from "../repositories/FacturaRepository.repository";
import { toFacturaDto } from "../mappers/facturaMapper";
import { FacturaHistorialService } from "./FacturaHistorialService.service";
import { PrismaFacturaRepository } from "../repositories/PrismaFacturaRepository.repository";
import { PrismaFacturaHistorialRepository } from "../repositories/PrismaFacturaHistorialRepository.repository";

// ── Tipos internos ─────────────────────────────────────────────────────────────

type RawRow = (string | number | boolean | null | undefined)[];

/** colIndex → nombre de campo interno (uuid, concepto, subtotal, …) */
type ColumnMap = Record<number, string>;

interface HeaderDetectionResult {
  /** Índice de array (0-based) de la fila que contiene el header */
  headerArrayIndex: number;
  /** Número de fila real en Excel (1-based) */
  headerExcelRow: number;
  columnMap: ColumnMap;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Convierte un valor de celda Excel a número.
 * Maneja: números nativos, strings con formato "$1,600.00", "1.600,00" (europeo),
 * "1 600" (espacio como separador de miles), porcentajes, etc.
 */
function parseNumericCell(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    return isFinite(value) ? value : null;
  }

  if (typeof value === "boolean") return null;

  const str = String(value).trim();
  if (str === "" || str === "-" || str === "N/A" || str.toLowerCase() === "na") return null;

  // Quitar símbolo de moneda y espacios
  let cleaned = str.replace(/[$€£¥\s]/g, "");

  // Detectar formato europeo: "1.600,00" (punto como miles, coma como decimal)
  const europeanFormat = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(cleaned);
  if (europeanFormat) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    // Formato estándar: quitar comas como separador de miles
    cleaned = cleaned.replace(/,/g, "");
  }

  const num = parseFloat(cleaned);
  return isFinite(num) ? num : null;
}

/**
 * Convierte cualquier valor de celda a string limpio, o null si está vacío.
 */
function parseCellToString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str === "" ? null : str;
}

/**
 * Detecta la fila de encabezado escaneando las primeras MAX_SCAN_ROWS filas.
 * Una fila es candidata si ≥ MIN_MATCHES de sus celdas coinciden con aliases conocidos.
 */
function detectHeaderRow(rows: RawRow[]): HeaderDetectionResult | null {
  const MAX_SCAN_ROWS = 30;
  const MIN_MATCHES = 3; // mínimo de columnas reconocidas para considerar la fila como header

  for (let i = 0; i < Math.min(rows.length, MAX_SCAN_ROWS); i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const columnMap: ColumnMap = {};
    let matchCount = 0;

    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      if (cell === null || cell === undefined || cell === "") continue;

      const normalized = normalizeColumnHeader(String(cell));
      const fieldName = COLUMN_ALIASES[normalized];

      if (fieldName) {
        // Si ya existe ese campo en el mapa (dos columnas con mismo alias), ignorar la segunda
        const alreadyMapped = Object.values(columnMap).includes(fieldName);
        if (!alreadyMapped) {
          columnMap[j] = fieldName;
          matchCount++;
        }
      }
    }

    if (matchCount >= MIN_MATCHES) {
      return {
        headerArrayIndex: i,
        headerExcelRow: i + 1, // Excel es 1-indexed
        columnMap,
      };
    }
  }

  return null;
}

/**
 * Verifica que todos los campos requeridos estén en el columnMap detectado.
 * Devuelve los labels en español de los campos faltantes.
 */
function getMissingRequiredFields(columnMap: ColumnMap): string[] {
  const detectedFields = new Set(Object.values(columnMap));
  return REQUIRED_FIELDS.filter((f) => !detectedFields.has(f)).map(
    (f) => FIELD_TO_LABEL[f] ?? f
  );
}

/**
 * Determina si una fila de datos está completamente vacía (la saltamos).
 */
function isEmptyRow(row: RawRow): boolean {
  return row.every((cell) => cell === null || cell === undefined || cell === "");
}

// ── Diff de campos ─────────────────────────────────────────────────────────────

/** Campos cuyo cambio es de alto riesgo (financiero / fiscal) */
const HIGH_RISK_FIELDS = new Set([
  "subtotal",
  "total",
  "totalImpuestosTransladados",
  "totalImpuestosRetenidos",
  "rfcEmisor",
  "rfcReceptor",
  "moneda",
]);

/** Normaliza un valor string para comparación insensible a mayúsculas y espacios */
function normalizeStr(v: string | null | undefined): string {
  if (v === null || v === undefined) return "";
  return String(v).trim().toUpperCase();
}

/** Compara dos números con tolerancia para evitar falsos positivos por punto flotante */
function numsEqual(a: number | null | undefined, b: number | null | undefined): boolean {
  const na = a ?? null;
  const nb = b ?? null;
  if (na === null && nb === null) return true;
  if (na === null || nb === null) return false;
  return Math.abs(na - nb) < 0.005;
}

/**
 * Compara todos los campos de una fila Excel contra una factura existente
 * y devuelve la lista de campos que difieren.
 */
function computeChangedFields(
  row: ValidatedExcelRowDto,
  existing: import("../dtos/FacturaDto.dto").FacturaDto
): FieldChange[] {
  type FieldDef = {
    field: string;
    label: string;
    excelVal: string | number | null;
    sysVal: string | number | null;
    isNumeric?: boolean;
  };

  const defs: FieldDef[] = [
    { field: "concepto",                   label: "Concepto",            excelVal: row.concepto,                            sysVal: existing.concepto },
    { field: "subtotal",                   label: "Subtotal",            excelVal: row.subtotal,                            sysVal: existing.subtotal,                             isNumeric: true },
    { field: "total",                      label: "Total",               excelVal: row.total,                               sysVal: existing.total,                                isNumeric: true },
    { field: "rfcEmisor",                  label: "RFC Emisor",          excelVal: row.rfcEmisor,                           sysVal: existing.rfcEmisor },
    { field: "nombreEmisor",               label: "Nombre Emisor",       excelVal: row.nombreEmisor ?? null,                sysVal: existing.nombreEmisor ?? null },
    { field: "rfcReceptor",               label: "RFC Receptor",         excelVal: row.rfcReceptor,                        sysVal: existing.rfcReceptor },
    { field: "nombreReceptor",             label: "Nombre Receptor",     excelVal: row.nombreReceptor ?? null,              sysVal: existing.nombreReceptor ?? null },
    { field: "serie",                      label: "Serie",               excelVal: row.serie ?? null,                       sysVal: existing.serie ?? null },
    { field: "folio",                      label: "Folio",               excelVal: row.folio ?? null,                       sysVal: existing.folio ?? null },
    { field: "totalImpuestosTransladados", label: "Imp. Trasladados",    excelVal: row.totalImpuestosTransladados ?? null,  sysVal: existing.totalImpuestosTransladados ?? null,   isNumeric: true },
    { field: "totalImpuestosRetenidos",    label: "Imp. Retenidos",      excelVal: row.totalImpuestosRetenidos ?? null,     sysVal: existing.totalImpuestosRetenidos ?? null,      isNumeric: true },
    { field: "metodoPago",                 label: "Método Pago",         excelVal: row.metodoPago ?? null,                  sysVal: existing.metodoPago ?? null },
    { field: "moneda",                     label: "Moneda",              excelVal: row.moneda ?? "MXN",                     sysVal: existing.moneda ?? "MXN" },
    { field: "usoCfdi",                    label: "Uso CFDI",            excelVal: row.usoCfdi ?? null,                     sysVal: existing.usoCfdi ?? null },
    { field: "statusPago",                 label: "Status Pago",         excelVal: row.statusPago ?? null,                  sysVal: existing.statusPago ?? null },
  ];

  const changes: FieldChange[] = [];

  for (const def of defs) {
    const changed = def.isNumeric
      ? !numsEqual(def.excelVal as number | null, def.sysVal as number | null)
      : normalizeStr(def.excelVal as string | null) !== normalizeStr(def.sysVal as string | null);

    if (changed) {
      changes.push({
        field: def.field,
        label: def.label,
        oldValue: def.sysVal,
        newValue: def.excelVal,
        isHighRisk: HIGH_RISK_FIELDS.has(def.field),
      });
    }
  }

  return changes;
}

// ── Servicio ───────────────────────────────────────────────────────────────────

export class FacturaExcelImportService {
  constructor(
    private facturaRepository: FacturaRepository,
    private historialService: FacturaHistorialService,
    private prisma: PrismaClient,
  ) {}

  // ── Paso 1: Parsear ──────────────────────────────────────────────────────────

  /**
   * Lee el archivo Excel y extrae filas brutas.
   * Detecta automáticamente la fila de header (puede estar en cualquier posición).
   * Devuelve las filas junto con metadata de la detección.
   */
  async parseExcelFile(fileBuffer: ArrayBuffer): Promise<
    Result<
      {
        rows: RawRow[];
        headerDetection: HeaderDetectionResult;
        totalRawRows: number;
      },
      Error
    >
  > {
    try {
      const workbook = XLSX.read(fileBuffer, {
        type: "array",
        cellDates: false, // los manejamos nosotros para mayor control
        raw: true,        // mantener tipos nativos (números como números)
      });

      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        return Err(new Error("El archivo Excel no contiene hojas de cálculo."));
      }

      const worksheet = workbook.Sheets[sheetName];

      // Leer como array de arrays (sin asumir que la fila 1 es el header)
      const allRows = XLSX.utils.sheet_to_json<RawRow>(worksheet, {
        header: 1,
        defval: null,
        raw: true,
      });

      if (allRows.length === 0) {
        return Err(new Error("El archivo Excel está vacío."));
      }

      // Detectar el header
      const headerDetection = detectHeaderRow(allRows);

      if (!headerDetection) {
        return Err(
          new Error(
            `No se encontró una fila de encabezados reconocible en las primeras 30 filas del archivo.\n` +
            `Asegúrate de que el Excel contenga columnas como: UUID, Concepto, Subtotal, Total, RFC Emisor, RFC Receptor.\n` +
            `Los nombres no necesitan ser exactos (por ejemplo, "RFC Cliente" o "Cliente/Proveedor" también son válidos).`
          )
        );
      }

      // Verificar campos requeridos
      const missing = getMissingRequiredFields(headerDetection.columnMap);
      if (missing.length > 0) {
        return Err(
          new Error(
            `Se detectó el encabezado en la fila ${headerDetection.headerExcelRow}, ` +
            `pero faltan las siguientes columnas obligatorias: ${missing.join(", ")}.`
          )
        );
      }

      // Filas de datos: todo lo que está DESPUÉS del header
      const dataRows = allRows.slice(headerDetection.headerArrayIndex + 1);

      if (dataRows.length === 0) {
        return Err(
          new Error(
            `Se detectó el encabezado en la fila ${headerDetection.headerExcelRow}, ` +
            `pero no hay filas de datos debajo de él.`
          )
        );
      }

      return Ok({
        rows: dataRows,
        headerDetection,
        totalRawRows: dataRows.length,
      });
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error inesperado al procesar el archivo Excel.")
      );
    }
  }

  // ── Paso 2: Mapear y validar ─────────────────────────────────────────────────

  /**
   * Mapea una fila bruta a un objeto parcial usando el columnMap.
   */
  private mapRawRowToDto(
    row: RawRow,
    columnMap: ColumnMap,
    excelRowNumber: number,
  ): Record<string, unknown> {
    const mapped: Record<string, unknown> = { rowNumber: excelRowNumber };

    for (const [colIndexStr, fieldName] of Object.entries(columnMap)) {
      const colIndex = parseInt(colIndexStr);
      const raw = row[colIndex];

      // Campos numéricos
      if (
        fieldName === "subtotal" ||
        fieldName === "total" ||
        fieldName === "iva" ||
        fieldName === "totalImpuestosTransladados" ||
        fieldName === "totalImpuestosRetenidos"
      ) {
        const num = parseNumericCell(raw);
        mapped[fieldName] = num; // null si vacío/inválido — Zod lo capturará si es requerido
      } else {
        mapped[fieldName] = parseCellToString(raw);
      }
    }

    return mapped;
  }

  /**
   * Valida las filas usando el schema Zod.
   * Devuelve filas válidas y lista de errores con mensajes amigables.
   */
  validateRows(
    rows: RawRow[],
    headerDetection: HeaderDetectionResult,
  ): {
    valid: Partial<ImportFacturaExcelRowDto>[];
    errors: ErrorValidacionDto[];
  } {
    const valid: Partial<ImportFacturaExcelRowDto>[] = [];
    const errors: ErrorValidacionDto[] = [];

    const { columnMap, headerArrayIndex } = headerDetection;

    rows.forEach((row, dataIndex) => {
      // Número de fila real en el Excel
      const excelRowNumber = headerArrayIndex + dataIndex + 2; // +1 header, +1 1-indexed

      // Saltar filas completamente vacías sin reportar error
      if (isEmptyRow(row)) return;

      const mappedRow = this.mapRawRowToDto(row, columnMap, excelRowNumber);
      const result = importFacturaExcelRowSchema.safeParse(mappedRow);

      if (result.success) {
        valid.push({ ...result.data, rowNumber: excelRowNumber });
      } else {
        // Convertir errores de Zod a mensajes amigables en español
        const friendlyErrors = result.error.issues.map((issue) => {
          const fieldKey = issue.path[0] ? String(issue.path[0]) : null;
          const label = fieldKey ? (FIELD_TO_LABEL[fieldKey] ?? fieldKey) : "Campo";
          return `${label}: ${issue.message}`;
        });

        errors.push({
          rowNumber: excelRowNumber,
          errors: friendlyErrors,
          rawData: mappedRow as Partial<ImportFacturaExcelRowDto>,
        });
      }
    });

    return { valid, errors };
  }

  // ── Paso 3: Detectar duplicados ──────────────────────────────────────────────

  async checkDuplicates(rows: Partial<ImportFacturaExcelRowDto>[]): Promise<{
    nuevas: Partial<ImportFacturaExcelRowDto>[];
    duplicadas: DuplicadaDto[];
  }> {
    const nuevas: Partial<ImportFacturaExcelRowDto>[] = [];
    const duplicadas: DuplicadaDto[] = [];

    const uuids = rows.map((r) => r.uuid).filter((u): u is string => !!u);

    const existingFacturas = await this.prisma.factura.findMany({
      where: { uuid: { in: uuids } },
      include: { ingresadoPorRef: true },
    });

    const existingMap = new Map(existingFacturas.map((f) => [f.uuid, f]));

    for (const row of rows) {
      const existing = existingMap.get(row.uuid!);
      if (existing) {
        const existingDto = toFacturaDto(existing);
        const validatedRow = row as ValidatedExcelRowDto;
        const changedFields = computeChangedFields(validatedRow, existingDto);

        duplicadas.push({
          row: validatedRow,
          existing: existingDto,
          shouldUpdate: false,
          changedFields,
          hasHighRiskChanges: changedFields.some((c) => c.isHighRisk),
        });
      } else {
        nuevas.push(row);
      }
    }

    return { nuevas, duplicadas };
  }

  // ── Pipeline completo: Preview ───────────────────────────────────────────────

  async previewImport(
    fileBuffer: ArrayBuffer,
    fileName: string,
  ): Promise<Result<ImportExcelPreviewDto, Error>> {
    // 1. Parsear
    const parseResult = await this.parseExcelFile(fileBuffer);
    if (!parseResult.ok) return parseResult;

    const { rows, headerDetection } = parseResult.value;

    // 2. Validar
    const { valid, errors } = this.validateRows(rows, headerDetection);

    // 3. Duplicados
    const { nuevas, duplicadas } = await this.checkDuplicates(valid);

    // 4. Construir preview
    const validatedNuevas: ValidatedExcelRowDto[] = nuevas.map((row) => ({
      ...(row as ImportFacturaExcelRowDto),
      isValid: true,
      errors: [],
    }));

    for (const dup of duplicadas) {
      dup.row = {
        ...(dup.row as ImportFacturaExcelRowDto),
        isValid: true,
        errors: [],
      };
    }

    // Contar solo filas no vacías procesadas
    const processedRows = rows.filter((r) => !isEmptyRow(r)).length;

    return Ok({
      fileName,
      totalRows: processedRows,
      headerExcelRow: headerDetection.headerExcelRow,
      nuevas: validatedNuevas,
      duplicadas,
      errores: errors,
      resumen: {
        totalNuevas: validatedNuevas.length,
        totalDuplicadas: duplicadas.length,
        totalErrores: errors.length,
      },
    } as ImportExcelPreviewDto);
  }

  // ── Pipeline completo: Execute ───────────────────────────────────────────────

  async executeImport(
    preview: ImportExcelPreviewDto,
    options: ImportOptionsDto,
    usuarioId: string | null,
  ): Promise<Result<ImportExecutionResultDto, Error>> {
    const resultados: ImportFacturaResultDto[] = [];
    let creadas = 0;
    let actualizadas = 0;
    let omitidas = 0;
    let errores = 0;

    try {
      await this.prisma.$transaction(async (tx) => {
        const txFacturaRepo = new PrismaFacturaRepository(tx);
        const txHistorialRepo = new PrismaFacturaHistorialRepository(tx);
        const txHistorialService = new FacturaHistorialService(txHistorialRepo);

        // ── 1. Facturas nuevas ──────────────────────────────────────────────
        for (const row of preview.nuevas) {
          try {
            const newFactura = await txFacturaRepo.create({
              concepto: row.concepto,
              subtotal: row.subtotal,
              iva: row.iva ?? null,
              totalImpuestosTransladados: row.totalImpuestosTransladados ?? null,
              totalImpuestosRetenidos: row.totalImpuestosRetenidos ?? null,
              total: row.total,
              uuid: row.uuid,
              rfcEmisor: row.rfcEmisor,
              nombreEmisor: row.nombreEmisor ?? null,
              rfcReceptor: row.rfcReceptor,
              nombreReceptor: row.nombreReceptor ?? null,
              serie: row.serie ?? null,
              folio: row.folio ?? null,
              metodoPago: row.metodoPago ?? null,
              moneda: row.moneda || "MXN",
              usoCfdi: row.usoCfdi ?? null,
              status: (row.status as "VIGENTE" | "CANCELADA") ?? "VIGENTE",
              statusPago: row.statusPago ?? null,
              fechaEmision: row.fechaEmision ? new Date(row.fechaEmision) : null,
              fechaPago: row.fechaPago ? new Date(row.fechaPago) : null,
              facturaUrl: row.facturaUrl ?? null,
              ingresadoPor: usuarioId,
            });

            await txHistorialService.createHistorialForNewFactura(newFactura, usuarioId);

            resultados.push({
              rowNumber: row.rowNumber,
              uuid: row.uuid,
              status: "created",
              message: "Factura creada exitosamente",
              facturaId: newFactura.id,
            });
            creadas++;
          } catch (error) {
            resultados.push({
              rowNumber: row.rowNumber,
              uuid: row.uuid,
              status: "error",
              message: error instanceof Error ? error.message : "Error desconocido",
            });
            errores++;
          }
        }

        // ── 2. Duplicadas a actualizar ──────────────────────────────────────
        const duplicadasAActualizar = options.actualizarTodasDuplicadas
          ? preview.duplicadas
          : preview.duplicadas.filter((d) =>
              options.duplicadasAActualizar.includes(d.existing.id)
            );

        for (const dup of duplicadasAActualizar) {
          try {
            const existingFactura = await tx.factura.findUnique({
              where: { id: dup.existing.id },
              include: { ingresadoPorRef: true },
            }) as (Awaited<ReturnType<typeof tx.factura.findUnique>> & {
              iva: number | null;
              fechaEmision: Date | null;
              facturaUrl: string | null;
            }) | null;

            if (!existingFactura) {
              resultados.push({
                rowNumber: dup.row.rowNumber,
                uuid: dup.row.uuid,
                status: "error",
                message: "Factura existente no encontrada en la base de datos",
              });
              errores++;
              continue;
            }

            const updatedFactura = await txFacturaRepo.update({
              id: dup.existing.id,
              concepto: dup.row.concepto,
              subtotal: dup.row.subtotal,
              iva: dup.row.iva ?? existingFactura.iva ?? null,
              totalImpuestosTransladados: dup.row.totalImpuestosTransladados ?? null,
              totalImpuestosRetenidos: dup.row.totalImpuestosRetenidos ?? null,
              total: dup.row.total,
              uuid: dup.row.uuid,
              rfcEmisor: dup.row.rfcEmisor,
              nombreEmisor: dup.row.nombreEmisor ?? existingFactura.nombreEmisor,
              rfcReceptor: dup.row.rfcReceptor,
              nombreReceptor: dup.row.nombreReceptor ?? existingFactura.nombreReceptor,
              serie: dup.row.serie ?? existingFactura.serie,
              folio: dup.row.folio ?? existingFactura.folio,
              metodoPago: dup.row.metodoPago ?? existingFactura.metodoPago,
              moneda: dup.row.moneda || String(existingFactura.moneda),
              usoCfdi: dup.row.usoCfdi ?? existingFactura.usoCfdi,
              status: (dup.row.status as "VIGENTE" | "CANCELADA") ?? (existingFactura.status as "VIGENTE" | "CANCELADA"),
              statusPago: dup.row.statusPago ?? existingFactura.statusPago,
              fechaEmision: dup.row.fechaEmision
                ? new Date(dup.row.fechaEmision)
                : existingFactura.fechaEmision ?? null,
              fechaPago: dup.row.fechaPago
                ? new Date(dup.row.fechaPago)
                : existingFactura.fechaPago ?? null,
              facturaUrl: dup.row.facturaUrl ?? existingFactura.facturaUrl ?? null,
            });

            await txHistorialService.createHistorialForUpdate(
              existingFactura,
              updatedFactura,
              usuarioId,
            );

            resultados.push({
              rowNumber: dup.row.rowNumber,
              uuid: dup.row.uuid,
              status: "updated",
              message: "Factura actualizada exitosamente",
              facturaId: updatedFactura.id,
            });
            actualizadas++;
          } catch (error) {
            resultados.push({
              rowNumber: dup.row.rowNumber,
              uuid: dup.row.uuid,
              status: "error",
              message: error instanceof Error ? error.message : "Error desconocido",
            });
            errores++;
          }
        }

        // ── 3. Duplicadas omitidas ──────────────────────────────────────────
        const duplicadasOmitidas = preview.duplicadas.filter(
          (d) =>
            !options.actualizarTodasDuplicadas &&
            !options.duplicadasAActualizar.includes(d.existing.id)
        );

        for (const dup of duplicadasOmitidas) {
          resultados.push({
            rowNumber: dup.row.rowNumber,
            uuid: dup.row.uuid,
            status: "skipped",
            message: "Duplicada — no seleccionada para actualizar",
          });
          omitidas++;
        }
      });

      return Ok({
        success: true,
        totalProcesadas: preview.totalRows,
        creadas,
        actualizadas,
        omitidas,
        errores,
        resultados,
      });
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error inesperado al ejecutar la importación.")
      );
    }
  }
}
