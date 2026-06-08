import type { PrismaClient } from "@prisma/client";
import type {
  S3Client as S3ClientType,
} from "@aws-sdk/client-s3";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import * as XLSX from "xlsx";
import { randomUUID } from "crypto";
import { Result, Ok, Err } from "@/core/shared/result/result";
import { ValidationError } from "@/core/shared/errors/domain";
import {
  detectHeaderRow,
  isEmptyRow,
  parseNumericCell,
  parseCellToString,
  parseSpanishDate,
  buildDedupSet,
} from "@/core/shared/excel-import";
import type {
  HeaderDetectionResult,
  ImportRowError,
  ImportError,
} from "@/core/shared/excel-import";
import { importMovimientoRowValidator } from "../validators/importMovimientoRowValidator";
import { computeMovimientoDedupHash } from "../../helpers/movimientoDedupHash";
import type { MovimientoRepository } from "../repositories/MovimientoRepository.repository";
import type { MovimientoImportPreviewDto } from "../dtos/MovimientoImportPreviewDto.dto";
import type { MovimientoImportResultDto } from "../dtos/MovimientoImportResultDto.dto";
import type { MovimientoImportRowDto } from "../dtos/MovimientoImportRowDto.dto";
import { PrismaMovimientoRepository } from "../repositories/PrismaMovimientoRepository.repository";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_ROWS = 1000;

/**
 * Column alias map per D12: maps canonical field names to accepted header
 * variations in bank-statement Excel files.
 */
const COLUMN_ALIASES: Record<string, string[]> = {
  titular: ["titular", "tit"],
  estadoCuenta: [
    "edo cta",
    "edo. cta.",
    "estado cuenta",
    "estado de cuenta",
    "cuenta",
    "edo de cta",
  ],
  fechaCorte: ["fecha corte", "fecha de corte", "f. corte"],
  fechaOperacion: [
    "fecha operacion",
    "fecha de operacion",
    "f. operacion",
  ],
  descripcionLiteral: [
    "descripcion literal en edo cta",
    "descripcion literal",
    "descripcion",
  ],
  abono: ["abono", "abonos", "ingreso", "ingresos"],
  cargo: ["cargo", "cargos", "egreso", "egresos"],
};

const REQUIRED_FIELDS = [
  "titular",
  "estadoCuenta",
  "fechaCorte",
  "fechaOperacion",
  "descripcionLiteral",
];

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

type RawRow = unknown[];

interface ParsedRow {
  tipo: string;
  titular: string;
  estadoCuenta: string;
  fechaCorte: string;
  fechaOperacion: string;
  descripcionLiteral: string;
  monto: number;
  dedupHash: string;
  sourceRowNumber: number;
}

interface ParseResult {
  valid: ParsedRow[];
  errors: ImportError[];
  skippedRows: number;
  headerRow: number;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class MovimientoExcelImportService {
  constructor(
    private readonly repo: MovimientoRepository,
    private readonly prisma: PrismaClient,
    private readonly s3Client: S3ClientType,
    private readonly s3Bucket: string
  ) {}

  // ── Preview ────────────────────────────────────────────────────────────────

  async previewImport(
    file: ArrayBuffer
  ): Promise<Result<MovimientoImportPreviewDto, Error>> {
    try {
      // 1. Parse and validate
      const parseResult = this.parseAndValidate(file);
      if (!parseResult.ok) return parseResult;
      const { valid, errors, skippedRows, headerRow } = parseResult.value;

      // 2. Intra-Excel dedup
      const { intraErrors, uniqueValid } = this.detectIntraDuplicates(valid);

      // 3. DB dedup
      const allHashes = uniqueValid.map((r) => r.dedupHash);
      const existingHashes = await this.repo.findDedupHashesIn(allHashes);
      const existingSet = new Set(existingHashes);

      const nuevas: MovimientoImportRowDto[] = [];
      const duplicadaRows: MovimientoImportRowDto[] = [];

      for (const row of uniqueValid) {
        const dto = this.toImportRowDto(row);
        if (existingSet.has(row.dedupHash)) {
          duplicadaRows.push(dto);
        } else {
          nuevas.push(dto);
        }
      }

      // 4. Upload temp file to S3
      const tempFileKey = `temp/imports/movimientos/${randomUUID()}.xlsx`;
      await this.uploadToS3(tempFileKey, file);

      // 5. Merge all errors
      const allErrors = [...errors, ...intraErrors];

      return Ok({
        nuevas,
        duplicadas: duplicadaRows.map((row) => ({
          row,
          existing: row,
          changedFields: [],
          hasHighRiskChanges: false,
        })),
        errores: allErrors,
        resumen: {
          nuevas: nuevas.length,
          duplicadas: duplicadaRows.length,
          errores: allErrors.length,
          totalRows:
            nuevas.length +
            duplicadaRows.length +
            allErrors.length +
            skippedRows,
        },
        headerRowDetectedAt: headerRow + 1, // 1-based
        tempFileKey,
      });
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error inesperado al procesar el archivo Excel")
      );
    }
  }

  // ── Execute ────────────────────────────────────────────────────────────────

  /**
   * Execute import: re-downloads the file from S3 and re-parses everything.
   * Does NOT trust any client-passed preview data (REQ-EIS-001).
   */
  async executeImport(
    tempFileKey: string,
    ingresadoPor: string | null
  ): Promise<Result<MovimientoImportResultDto, Error>> {
    try {
      // 1. Re-download file from S3
      const fileBuffer = await this.downloadFromS3(tempFileKey);
      if (!fileBuffer) {
        return Err(
          new Error(
            "No se pudo recuperar el archivo temporal. Es posible que haya expirado."
          )
        );
      }

      // 2. Re-parse + re-validate (same pipeline as preview)
      const parseResult = this.parseAndValidate(fileBuffer);
      if (!parseResult.ok) return parseResult;
      const { valid } = parseResult.value;

      // 3. Intra-Excel dedup
      const { uniqueValid } = this.detectIntraDuplicates(valid);

      // 4. DB dedup
      const allHashes = uniqueValid.map((r) => r.dedupHash);
      const existingHashes = await this.repo.findDedupHashesIn(allHashes);
      const existingSet = new Set(existingHashes);

      const nuevas = uniqueValid.filter(
        (r) => !existingSet.has(r.dedupHash)
      );

      // 5. Persist within transaction
      let created = 0;
      const skipped = existingSet.size;
      let errorCount = 0;
      const details: MovimientoImportResultDto["details"] = [];

      await this.prisma.$transaction(async (tx) => {
        const txRepo = new PrismaMovimientoRepository(tx);

        for (const row of nuevas) {
          try {
            const entity = await txRepo.create({
              tipo: row.tipo as "INGRESO" | "EGRESO",
              titular: row.titular,
              estadoCuenta: row.estadoCuenta,
              fechaCorte: new Date(row.fechaCorte),
              fechaOperacion: new Date(row.fechaOperacion),
              descripcionLiteral: row.descripcionLiteral,
              monto: row.monto,
              dedupHash: row.dedupHash,
              ingresadoPor,
              estado: "PAGADO",
            });

            details.push({
              rowNumber: row.sourceRowNumber,
              status: "created",
              entityId: entity.id,
              row: this.toImportRowDto(row),
              message: "Movimiento creado exitosamente",
            });
            created++;
          } catch (error) {
            details.push({
              rowNumber: row.sourceRowNumber,
              status: "error",
              row: this.toImportRowDto(row),
              message:
                error instanceof Error
                  ? error.message
                  : "Error al crear movimiento",
            });
            errorCount++;
          }
        }
      });

      // 6. Delete temp file from S3 (best effort)
      this.deleteFromS3(tempFileKey).catch(() => {
        /* ignore S3 cleanup failures */
      });

      return Ok({
        created,
        updated: 0,
        skipped,
        errors: errorCount,
        details,
      });
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error inesperado al ejecutar la importacion")
      );
    }
  }

  // ── Core parse + validate pipeline ─────────────────────────────────────────

  private parseAndValidate(
    file: ArrayBuffer
  ): Result<ParseResult, Error> {
    // Parse workbook
    const workbook = XLSX.read(file, {
      type: "array",
      cellDates: false,
      raw: true,
    });

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return Err(new Error("El archivo Excel no contiene hojas de calculo."));
    }

    const worksheet = workbook.Sheets[sheetName];
    const allRows = XLSX.utils.sheet_to_json<RawRow>(worksheet, {
      header: 1,
      defval: null,
      raw: true,
    });

    if (allRows.length === 0) {
      return Err(new Error("El archivo Excel esta vacio."));
    }

    // Detect header row using shared layer
    const headerResult = detectHeaderRow(allRows, COLUMN_ALIASES);
    if ("error" in headerResult) {
      return Err(
        new Error(
          `No se encontro una fila de encabezados reconocible. ` +
            `Asegurate de que el Excel contenga columnas como: Titular, Edo Cta, Fecha Corte, Fecha Operacion, Descripcion Literal.`
        )
      );
    }

    const { headerRow, columnMap } = headerResult as HeaderDetectionResult;

    // Check required fields
    const detectedFields = new Set(Object.keys(columnMap));
    const missingFields = REQUIRED_FIELDS.filter(
      (f) => !detectedFields.has(f)
    );
    if (missingFields.length > 0) {
      return Err(
        new Error(
          `Se detecto el encabezado en la fila ${headerRow + 1}, ` +
            `pero faltan columnas obligatorias: ${missingFields.join(", ")}.`
        )
      );
    }

    // Data rows after header
    const dataRows = allRows.slice(headerRow + 1);

    // 1000-row limit (REQ-EIS-004 / REQ-MI-007)
    const nonEmptyCount = dataRows.filter((r) => !isEmptyRow(r)).length;
    if (nonEmptyCount > MAX_ROWS) {
      return Err(
        new ValidationError(
          "ROW_LIMIT_EXCEEDED",
          `El archivo excede el limite maximo de ${MAX_ROWS} filas (encontradas ${nonEmptyCount})`
        )
      );
    }

    // Parse each data row
    const valid: ParsedRow[] = [];
    const errors: ImportError[] = [];
    let skippedRows = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const excelRowNumber = headerRow + i + 2; // +1 for header, +1 for 1-based

      if (isEmptyRow(row)) continue;

      // Map raw cells using columnMap
      const mapped = this.mapRawRow(row, columnMap);

      // INICIO skip (REQ-MI-003)
      if (this.isInicioRow(mapped)) {
        skippedRows++;
        continue;
      }

      // Parse dates with strict Spanish parser (REQ-EIS-002 / REQ-MI-006)
      const fechaCorte = parseSpanishDate(mapped.fechaCorte);
      const fechaOperacion = parseSpanishDate(mapped.fechaOperacion);

      const rowErrors: ImportRowError[] = [];

      if (!fechaCorte && mapped.fechaCorte !== null) {
        rowErrors.push({
          row: excelRowNumber,
          field: "fechaCorte",
          message: `Formato de fecha invalido para Fecha Corte: "${mapped.fechaCorte}"`,
        });
      }

      if (!fechaOperacion && mapped.fechaOperacion !== null) {
        rowErrors.push({
          row: excelRowNumber,
          field: "fechaOperacion",
          message: `Formato de fecha invalido para Fecha Operacion: "${mapped.fechaOperacion}"`,
        });
      }

      // Parse numeric values
      const abono = parseNumericCell(mapped.abono);
      const cargo = parseNumericCell(mapped.cargo);

      // Abono XOR Cargo rule (REQ-MI-002)
      const abonoPositive = abono !== null && abono > 0;
      const cargoPositive = cargo !== null && cargo > 0;

      if (abonoPositive && cargoPositive) {
        rowErrors.push({
          row: excelRowNumber,
          field: "abono/cargo",
          message:
            "La fila tiene valores positivos tanto en Abono como en Cargo. Solo uno puede ser positivo.",
        });
      } else if (!abonoPositive && !cargoPositive) {
        rowErrors.push({
          row: excelRowNumber,
          field: "abono/cargo",
          message:
            "La fila no tiene valores positivos en Abono ni en Cargo. Al menos uno debe ser positivo.",
        });
      }

      if (rowErrors.length > 0) {
        errors.push({ rowNumber: excelRowNumber, errors: rowErrors });
        continue;
      }

      // Derive tipo and monto
      const tipo = abonoPositive ? "INGRESO" : "EGRESO";
      const monto = abonoPositive ? abono! : cargo!;

      // Build row for Zod validation
      const titular = parseCellToString(mapped.titular) ?? "";
      const estadoCuenta = parseCellToString(mapped.estadoCuenta) ?? "";
      const descripcionLiteral =
        parseCellToString(mapped.descripcionLiteral) ?? "";

      const rowInput = {
        tipo,
        titular,
        estadoCuenta,
        fechaCorte: fechaCorte ? fechaCorte.toISOString() : "",
        fechaOperacion: fechaOperacion ? fechaOperacion.toISOString() : "",
        descripcionLiteral,
        monto,
        sourceRowNumber: excelRowNumber,
      };

      const validation = importMovimientoRowValidator.safeParse(rowInput);
      if (!validation.success) {
        const zodErrors: ImportRowError[] = validation.error.issues.map(
          (issue) => ({
            row: excelRowNumber,
            field: String(issue.path[0] ?? "unknown"),
            message: issue.message,
          })
        );
        errors.push({ rowNumber: excelRowNumber, errors: zodErrors });
        continue;
      }

      // Compute dedupHash (REQ-MI-004)
      const dedupHash = computeMovimientoDedupHash({
        titular,
        estadoCuenta,
        fechaOperacion: fechaOperacion!,
        monto,
        descripcionLiteral,
      });

      valid.push({
        tipo,
        titular,
        estadoCuenta,
        fechaCorte: fechaCorte!.toISOString(),
        fechaOperacion: fechaOperacion!.toISOString(),
        descripcionLiteral,
        monto,
        dedupHash,
        sourceRowNumber: excelRowNumber,
      });
    }

    return Ok({ valid, errors, skippedRows, headerRow });
  }

  // ── Intra-Excel dedup (REQ-EIS-003) ────────────────────────────────────────

  private detectIntraDuplicates(valid: ParsedRow[]): {
    intraErrors: ImportError[];
    uniqueValid: ParsedRow[];
  } {
    const { duplicates } = buildDedupSet(valid, (r) => r.dedupHash);

    if (duplicates.size === 0) {
      return { intraErrors: [], uniqueValid: valid };
    }

    // Mark the second+ occurrence as intra-duplicate errors
    const duplicateRowNumbers = new Set<number>();
    const intraErrors: ImportError[] = [];

    for (const [, group] of duplicates) {
      // Skip first occurrence, flag rest
      for (let i = 1; i < group.length; i++) {
        const row = group[i];
        duplicateRowNumbers.add(row.sourceRowNumber);
        intraErrors.push({
          rowNumber: row.sourceRowNumber,
          errors: [
            {
              row: row.sourceRowNumber,
              field: "dedupHash",
              message:
                "Fila duplicada dentro del mismo archivo Excel (mismos datos identificatorios que otra fila)",
            },
          ],
        });
      }
    }

    const uniqueValid = valid.filter(
      (r) => !duplicateRowNumbers.has(r.sourceRowNumber)
    );

    return { intraErrors, uniqueValid };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private mapRawRow(
    row: RawRow,
    columnMap: Record<string, number>
  ): Record<string, unknown> {
    const mapped: Record<string, unknown> = {};
    for (const [fieldName, colIndex] of Object.entries(columnMap)) {
      mapped[fieldName] = row[colIndex] ?? null;
    }
    return mapped;
  }

  /**
   * INICIO skip rule (REQ-MI-003): skip rows where descripcionLiteral
   * contains "INICIO" (case-insensitive) and both abono/cargo are 0 or empty.
   */
  private isInicioRow(mapped: Record<string, unknown>): boolean {
    const desc = parseCellToString(mapped.descripcionLiteral);
    if (!desc || !desc.toUpperCase().includes("INICIO")) return false;

    const abono = parseNumericCell(mapped.abono);
    const cargo = parseNumericCell(mapped.cargo);
    const abonoZero = abono === null || abono === 0;
    const cargoZero = cargo === null || cargo === 0;

    return abonoZero && cargoZero;
  }

  private toImportRowDto(row: ParsedRow): MovimientoImportRowDto {
    return {
      tipo: row.tipo,
      titular: row.titular,
      estadoCuenta: row.estadoCuenta,
      fechaCorte: row.fechaCorte,
      fechaOperacion: row.fechaOperacion,
      descripcionLiteral: row.descripcionLiteral,
      monto: row.monto,
      dedupHash: row.dedupHash,
      sourceRowNumber: row.sourceRowNumber,
    };
  }

  // ── S3 helpers ─────────────────────────────────────────────────────────────

  private async uploadToS3(
    key: string,
    data: ArrayBuffer
  ): Promise<void> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: Buffer.from(data),
        ContentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
    );
  }

  private async downloadFromS3(
    key: string
  ): Promise<ArrayBuffer | null> {
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.s3Bucket,
          Key: key,
        })
      );

      if (!response.Body) return null;

      // Convert ReadableStream / Blob to ArrayBuffer
      const bytes = await response.Body.transformToByteArray();
      return bytes.buffer as ArrayBuffer;
    } catch {
      return null;
    }
  }

  private async deleteFromS3(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
      })
    );
  }
}
