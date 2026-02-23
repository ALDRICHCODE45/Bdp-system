/**
 * DTO que representa una fila del archivo Excel de importación de facturas.
 * Estos son los datos crudos extraídos del Excel antes de ser procesados.
 */
export type ImportFacturaExcelRowDto = {
  rowNumber: number;
  uuid: string;
  concepto: string;
  subtotal: number;
  total: number;
  rfcEmisor: string;
  nombreReceptor?: string | null;
  rfcReceptor: string;
  serie?: string | null;
  folio?: string | null;
  totalImpuestosTransladados?: number | null;
  totalImpuestosRetenidos?: number | null;
  metodoPago?: string | null;
  moneda: string;
  usoCfdi?: string | null;
  nombreEmisor?: string | null;
  statusPago?: string | null;
};

/**
 * Fila validada con información adicional de procesamiento
 */
export type ValidatedExcelRowDto = ImportFacturaExcelRowDto & {
  isValid: boolean;
  errors: string[];
};
