/**
 * Represents ONE parsed row from the bank-statement Excel import.
 * All dates as ISO strings, monto as number. JSON-safe.
 */
export type MovimientoImportRowDto = {
  /** INGRESO or EGRESO — derived from Abono/Cargo columns */
  tipo: string;
  titular: string;
  estadoCuenta: string;
  /** ISO string */
  fechaCorte: string;
  /** ISO string */
  fechaOperacion: string;
  descripcionLiteral: string;
  monto: number;
  dedupHash: string;
  /** 1-based Excel row number for error reporting */
  sourceRowNumber: number;
};
