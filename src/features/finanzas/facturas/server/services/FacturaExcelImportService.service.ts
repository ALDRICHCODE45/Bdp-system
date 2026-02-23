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
} from "../dtos/ImportExcelPreviewDto.dto";
import {
  ImportFacturaResultDto,
  ImportExecutionResultDto,
} from "../dtos/ImportFacturaResultDto.dto";
import {
  importFacturaExcelRowSchema,
  EXCEL_COLUMN_TO_FIELD_MAP,
  REQUIRED_EXCEL_COLUMNS,
} from "../validators/importFacturaExcelRowSchema";
import { FacturaRepository } from "../repositories/FacturaRepository.repository";
import { toFacturaDto } from "../mappers/facturaMapper";
import { FacturaHistorialService } from "./FacturaHistorialService.service";

type RawExcelRow = Record<string, unknown>;

export class FacturaExcelImportService {
  constructor(
    private facturaRepository: FacturaRepository,
    private historialService: FacturaHistorialService,
    private prisma: PrismaClient,
  ) { }

  /**
   * Parsea un archivo Excel y extrae las filas de datos
   */
  async parseExcelFile(
    fileBuffer: ArrayBuffer,
  ): Promise<Result<RawExcelRow[], Error>> {
    try {
      const workbook = XLSX.read(fileBuffer, {
        type: "array",
        cellDates: true,
      });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        return Err(new Error("El archivo Excel no contiene hojas"));
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet, {
        raw: false,
        dateNF: "yyyy-mm-dd",
      });

      if (jsonData.length === 0) {
        return Err(new Error("El archivo Excel no contiene datos"));
      }

      // Validar que las columnas requeridas estén presentes
      const headers = Object.keys(jsonData[0]);
      const missingColumns = REQUIRED_EXCEL_COLUMNS.filter(
        (col) => !headers.includes(col),
      );

      if (missingColumns.length > 0) {
        return Err(
          new Error(
            `Faltan las siguientes columnas requeridas: ${missingColumns.join(", ")}`,
          ),
        );
      }

      return Ok(jsonData);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al procesar el archivo Excel"),
      );
    }
  }

  /**
   * Convierte una fila cruda del Excel al formato del DTO
   */
  private mapRawRowToDto(
    rawRow: RawExcelRow,
    rowNumber: number,
  ): Partial<ImportFacturaExcelRowDto> {
    const mapped: Record<string, unknown> = { rowNumber };

    for (const [excelColumn, fieldName] of Object.entries(
      EXCEL_COLUMN_TO_FIELD_MAP,
    )) {
      const value = rawRow[excelColumn];

      if (
        (fieldName === "subtotal" ||
          fieldName === "total" ||
          fieldName === "totalImpuestosTransladados" ||
          fieldName === "totalImpuestosRetenidos") &&
        value !== undefined
      ) {
        // Convertir montos a número
        const numValue =
          typeof value === "string"
            ? parseFloat(value.replace(/[,$]/g, ""))
            : Number(value);
        mapped[fieldName] = isNaN(numValue) ? value : numValue;
      } else {
        mapped[fieldName] = value;
      }
    }

    return mapped as Partial<ImportFacturaExcelRowDto>;
  }

  /**
   * Valida las filas del Excel usando el schema Zod
   */
  validateRows(rawRows: RawExcelRow[]): {
    valid: Partial<ImportFacturaExcelRowDto>[];
    errors: ErrorValidacionDto[];
  } {
    const valid: Partial<ImportFacturaExcelRowDto>[] = [];
    const errors: ErrorValidacionDto[] = [];

    rawRows.forEach((rawRow, index) => {
      const rowNumber = index + 2; // +2 porque Excel empieza en 1 y la fila 1 es el header
      const mappedRow = this.mapRawRowToDto(rawRow, rowNumber);

      const result = importFacturaExcelRowSchema.safeParse(mappedRow);

      if (result.success) {
        valid.push({ ...result.data, rowNumber });
      } else {
        errors.push({
          rowNumber,
          errors: result.error.issues.map(
            (e) => `${e.path.join(".")}: ${e.message}`,
          ),
          rawData: mappedRow,
        });
      }
    });

    return { valid, errors };
  }

  /**
   * Busca facturas duplicadas por uuid
   */
  async checkDuplicates(rows: Partial<ImportFacturaExcelRowDto>[]): Promise<{
    nuevas: Partial<ImportFacturaExcelRowDto>[];
    duplicadas: DuplicadaDto[];
  }> {
    const nuevas: Partial<ImportFacturaExcelRowDto>[] = [];
    const duplicadas: DuplicadaDto[] = [];

    const uuids = rows
      .map((r) => r.uuid)
      .filter((u): u is string => !!u);

    // Buscar todas las facturas existentes con esos UUIDs
    const existingFacturas = await this.prisma.factura.findMany({
      where: {
        uuid: { in: uuids },
      },
      include: {
        ingresadoPorRef: true,
      },
    });

    const existingMap = new Map(
      existingFacturas.map((f) => [f.uuid, f]),
    );

    for (const row of rows) {
      const existing = existingMap.get(row.uuid!);
      if (existing) {
        duplicadas.push({
          row: row as ValidatedExcelRowDto,
          existing: toFacturaDto(existing),
          shouldUpdate: false,
        });
      } else {
        nuevas.push(row);
      }
    }

    return { nuevas, duplicadas };
  }

  /**
   * Genera un preview completo de la importación
   */
  async previewImport(
    fileBuffer: ArrayBuffer,
    fileName: string,
  ): Promise<Result<ImportExcelPreviewDto, Error>> {
    // 1. Parsear Excel
    const parseResult = await this.parseExcelFile(fileBuffer);
    if (!parseResult.ok) {
      return parseResult;
    }

    const rawRows = parseResult.value;

    // 2. Validar filas
    const { valid, errors } = this.validateRows(rawRows);

    // 3. Verificar duplicados
    const { nuevas, duplicadas } = await this.checkDuplicates(valid);

    // 4. Construir filas validadas
    const validatedNuevas: ValidatedExcelRowDto[] = nuevas.map((row) => ({
      ...(row as ImportFacturaExcelRowDto),
      isValid: true,
      errors: [],
    }));

    // Actualizar duplicadas con info validada
    for (const dup of duplicadas) {
      dup.row = {
        ...(dup.row as ImportFacturaExcelRowDto),
        isValid: true,
        errors: [],
      };
    }

    const preview: ImportExcelPreviewDto = {
      fileName,
      totalRows: rawRows.length,
      nuevas: validatedNuevas,
      duplicadas,
      errores: errors,
      resumen: {
        totalNuevas: validatedNuevas.length,
        totalDuplicadas: duplicadas.length,
        totalErrores: errors.length,
      },
    };

    return Ok(preview);
  }

  /**
   * Ejecuta la importación basándose en el preview
   */
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
        // Importar dinámicamente los repositorios para la transacción
        const { PrismaFacturaRepository } =
          await import("../repositories/PrismaFacturaRepository.repository");
        const { PrismaFacturaHistorialRepository } =
          await import("../repositories/PrismaFacturaHistorialRepository.repository");
        const { FacturaHistorialService } =
          await import("./FacturaHistorialService.service");

        const tempFacturaRepository = new PrismaFacturaRepository(tx);
        const tempHistorialRepository = new PrismaFacturaHistorialRepository(
          tx,
        );
        const tempHistorialService = new FacturaHistorialService(
          tempHistorialRepository,
        );

        // 1. Procesar facturas nuevas
        for (const row of preview.nuevas) {
          try {
            const newFactura = await tempFacturaRepository.create({
              concepto: row.concepto,
              subtotal: row.subtotal,
              totalImpuestosTransladados: row.totalImpuestosTransladados ?? null,
              totalImpuestosRetenidos: row.totalImpuestosRetenidos ?? null,
              total: row.total,
              uuid: row.uuid,
              rfcEmisor: row.rfcEmisor,
              nombreReceptor: row.nombreReceptor ?? null,
              rfcReceptor: row.rfcReceptor,
              metodoPago: row.metodoPago ?? null,
              moneda: row.moneda || "MXN",
              usoCfdi: row.usoCfdi ?? null,
              status: "BORRADOR",
              nombreEmisor: row.nombreEmisor ?? null,
              statusPago: row.statusPago ?? null,
              fechaPago: null,
              ingresadoPor: usuarioId,
            });

            // Crear historial
            await tempHistorialService.createHistorialForNewFactura(
              newFactura,
              usuarioId,
            );

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
              message:
                error instanceof Error ? error.message : "Error desconocido",
            });
            errores++;
          }
        }

        // 2. Procesar duplicadas que el usuario quiere actualizar
        const duplicadasAActualizar = options.actualizarTodasDuplicadas
          ? preview.duplicadas
          : preview.duplicadas.filter((d) =>
            options.duplicadasAActualizar.includes(d.existing.id),
          );

        for (const dup of duplicadasAActualizar) {
          try {
            const existingFactura = await tx.factura.findUnique({
              where: { id: dup.existing.id },
              include: {
                ingresadoPorRef: true,
              },
            });

            if (!existingFactura) {
              resultados.push({
                rowNumber: dup.row.rowNumber,
                uuid: dup.row.uuid,
                status: "error",
                message: "Factura existente no encontrada",
              });
              errores++;
              continue;
            }

            const updatedFactura = await tempFacturaRepository.update({
              id: dup.existing.id,
              concepto: dup.row.concepto,
              subtotal: dup.row.subtotal,
              totalImpuestosTransladados: dup.row.totalImpuestosTransladados ?? null,
              totalImpuestosRetenidos: dup.row.totalImpuestosRetenidos ?? null,
              total: dup.row.total,
              uuid: dup.row.uuid,
              rfcEmisor: dup.row.rfcEmisor,
              nombreReceptor: dup.row.nombreReceptor ?? existingFactura.nombreReceptor,
              rfcReceptor: dup.row.rfcReceptor,
              metodoPago: dup.row.metodoPago ?? existingFactura.metodoPago,
              moneda: dup.row.moneda || String(existingFactura.moneda),
              usoCfdi: dup.row.usoCfdi ?? existingFactura.usoCfdi,
              status: existingFactura.status,
              nombreEmisor: dup.row.nombreEmisor ?? existingFactura.nombreEmisor,
              statusPago: dup.row.statusPago ?? existingFactura.statusPago,
              fechaPago: existingFactura.fechaPago,
            });

            // Crear historial de actualización
            await tempHistorialService.createHistorialForUpdate(
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
              message:
                error instanceof Error ? error.message : "Error desconocido",
            });
            errores++;
          }
        }

        // Las duplicadas no seleccionadas se marcan como omitidas
        const duplicadasOmitidas = preview.duplicadas.filter(
          (d) =>
            !options.actualizarTodasDuplicadas &&
            !options.duplicadasAActualizar.includes(d.existing.id),
        );

        for (const dup of duplicadasOmitidas) {
          resultados.push({
            rowNumber: dup.row.rowNumber,
            uuid: dup.row.uuid,
            status: "skipped",
            message: "Factura duplicada - no seleccionada para actualizar",
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
          : new Error("Error al ejecutar la importación"),
      );
    }
  }
}
