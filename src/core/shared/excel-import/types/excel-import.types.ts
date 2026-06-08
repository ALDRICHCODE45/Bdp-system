/**
 * Generic types for the shared Excel import infrastructure.
 *
 * All types are parameterized — consumers provide their own row shapes.
 * No feature-specific names (Movimiento, Factura, etc.) belong here.
 */

// ── Import Step ────────────────────────────────────────────────────────────────

/** The current step in the import wizard flow. */
export type ImportStep = "upload" | "preview" | "executing" | "results";

// ── Row-Level Errors ───────────────────────────────────────────────────────────

/** A single validation error on a specific field within a row. */
export interface ImportRowError {
  /** 1-based Excel row number */
  row: number;
  /** Field name that failed validation */
  field: string;
  /** Human-readable error message */
  message: string;
}

// ── Field Change (Diff) ────────────────────────────────────────────────────────

/** Represents a single field difference between an Excel row and an existing DB record. */
export interface FieldChange {
  /** Internal field name */
  field: string;
  /** Previous value in the system */
  oldValue: unknown;
  /** New value from the Excel file */
  newValue: unknown;
  /** True when the change affects critical fields (financial, fiscal, etc.) */
  isHighRisk?: boolean;
}

// ── Import Error (Row-Level) ───────────────────────────────────────────────────

/** A row that failed validation, with all its errors. */
export interface ImportError {
  /** 1-based Excel row number */
  rowNumber: number;
  /** All validation errors for this row */
  errors: ImportRowError[];
}

// ── Import Duplicate ───────────────────────────────────────────────────────────

/** A row that matched an existing DB record, with the diff details. */
export interface ImportDuplicate<TRow> {
  /** The parsed row from the Excel file */
  row: TRow;
  /** The existing record from the database */
  existing: TRow;
  /** Fields that differ between the Excel row and the existing record */
  changedFields: FieldChange[];
  /** True if any of the changed fields are high-risk */
  hasHighRiskChanges: boolean;
}

// ── Import Preview ─────────────────────────────────────────────────────────────

/** Preview result returned after parsing and validating an Excel file. */
export interface ImportPreviewDto<TRow> {
  /** Rows that are new (no DB match) and passed validation */
  nuevas: TRow[];
  /** Rows that matched existing DB records */
  duplicadas: ImportDuplicate<TRow>[];
  /** Rows that failed validation */
  errores: ImportError[];
  /** Summary counts */
  resumen: {
    nuevas: number;
    duplicadas: number;
    errores: number;
    totalRows: number;
  };
  /** The 1-based Excel row where the header was detected */
  headerRowDetectedAt?: number;
}

// ── Import Execution Result ────────────────────────────────────────────────────

/** Result of executing an import (creating/updating records). */
export interface ImportExecutionResultDto<TRow> {
  /** Number of records created */
  created: number;
  /** Number of records updated */
  updated: number;
  /** Number of records skipped (duplicates not selected for update) */
  skipped: number;
  /** Number of rows that encountered errors during execution */
  errors: number;
  /** Per-row details */
  details: ImportRowDetailDto<TRow>[];
}

/** Detail for a single row's execution outcome. */
export interface ImportRowDetailDto<TRow> {
  /** 1-based Excel row number */
  rowNumber: number;
  /** Outcome of this row */
  status: "created" | "updated" | "skipped" | "error";
  /** ID of the created/updated entity (if applicable) */
  entityId?: string;
  /** The parsed row data (for display purposes) */
  row?: TRow;
  /** Human-readable message (especially useful for errors) */
  message?: string;
}

// ── Import Config ──────────────────────────────────────────────────────────────

/**
 * Configuration object that features pass to the generic import service.
 * Encapsulates all feature-specific logic so the shared layer stays generic.
 *
 * @template TRow - The parsed row type (e.g., MovimientoPreviewRow)
 * @template TCreateArgs - The arguments for creating a new record
 */
export interface ImportConfig<TRow, TCreateArgs> {
  /** Field names that must be non-null after parsing */
  requiredFields: string[];

  /**
   * Map of canonical field name to list of accepted column header aliases.
   * Example: { "estadoCuenta": ["edo cta", "estado de cuenta", "edo. cta"] }
   */
  columnAliases: Record<string, string[]>;

  /** Parse a raw row (keyed by canonical field name) into a typed row */
  parseRow: (rawRow: Record<string, unknown>) => TRow;

  /** Validate a parsed row. Returns ok:true or a list of errors. */
  validateRow: (row: TRow) => { ok: boolean; errors: ImportRowError[] };

  /** Generate a deduplication key from a parsed row */
  dedupKey: (row: TRow) => string;

  /** Map a parsed row to the arguments needed to create a new record */
  mapToCreateArgs: (row: TRow) => TCreateArgs;

  /** Maximum number of data rows allowed per file (default: 1000) */
  maxRows?: number;

  /**
   * Optional predicate to skip specific rows during parsing.
   * Useful for skipping sentinel rows (e.g., "INICIO" rows in movimientos).
   *
   * @param rawRow - The raw cell values keyed by canonical field name
   * @param rowIndex - 0-based index within data rows (after header)
   * @returns true to skip this row
   */
  skipRowFn?: (rawRow: Record<string, unknown>, rowIndex: number) => boolean;
}
