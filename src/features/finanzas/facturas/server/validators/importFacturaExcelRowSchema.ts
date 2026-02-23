import { z } from "zod";

/**
 * Schema de validación para una fila del archivo Excel de importación.
 * Este schema valida los datos crudos extraídos del Excel.
 */
export const importFacturaExcelRowSchema = z.object({
  uuid: z
    .string()
    .min(1, "El UUID es requerido")
    .transform((val) => val.trim()),

  concepto: z
    .string()
    .min(1, "El concepto es requerido")
    .transform((val) => val.trim()),

  subtotal: z
    .number({ message: "El subtotal debe ser un número" })
    .min(0, "El subtotal debe ser mayor o igual a 0"),

  total: z
    .number({ message: "El total debe ser un número" })
    .min(0, "El total debe ser mayor o igual a 0"),

  rfcEmisor: z
    .string()
    .min(12, "El RFC emisor debe tener al menos 12 caracteres")
    .max(13, "El RFC emisor debe tener máximo 13 caracteres")
    .transform((val) => val.trim().toUpperCase()),

  nombreReceptor: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? val.trim() : null)),

  rfcReceptor: z
    .string()
    .min(12, "El RFC receptor debe tener al menos 12 caracteres")
    .max(13, "El RFC receptor debe tener máximo 13 caracteres")
    .transform((val) => val.trim().toUpperCase()),

  serie: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? val.trim() : null)),

  folio: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? val.trim() : null)),

  totalImpuestosTransladados: z
    .number()
    .optional()
    .nullable(),

  totalImpuestosRetenidos: z
    .number()
    .optional()
    .nullable(),

  metodoPago: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? val.trim() : null)),

  moneda: z
    .string()
    .default("MXN")
    .transform((val) => val.trim()),

  usoCfdi: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? val.trim() : null)),

  nombreEmisor: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? val.trim() : null)),

  statusPago: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? val.trim() : null)),
});

export type ImportFacturaExcelRowInput = z.infer<typeof importFacturaExcelRowSchema>;

/**
 * Schema para validar el header del Excel
 * Verifica que las columnas requeridas estén presentes
 */
export const excelHeadersSchema = z.object({
  "UUID": z.string(),
  "Concepto": z.string(),
  "Subtotal": z.string(),
  "Total": z.string(),
  "RFC Emisor": z.string(),
  "RFC Receptor": z.string(),
});

/**
 * Columnas requeridas del Excel
 */
export const REQUIRED_EXCEL_COLUMNS = [
  "UUID",
  "Concepto",
  "Subtotal",
  "Total",
  "RFC Emisor",
  "RFC Receptor",
] as const;

/**
 * Columnas opcionales del Excel
 */
export const OPTIONAL_EXCEL_COLUMNS = [
  "Serie",
  "Folio",
  "Impuestos Trasladados",
  "Impuestos Retenidos",
  "Método Pago",
  "Moneda",
  "Uso CFDI",
  "Nombre Emisor",
  "Nombre Receptor",
  "Status Pago",
] as const;

/**
 * Todas las columnas del Excel en orden
 */
export const ALL_EXCEL_COLUMNS = [
  ...REQUIRED_EXCEL_COLUMNS,
  ...OPTIONAL_EXCEL_COLUMNS,
] as const;

/**
 * Mapeo de columnas del Excel a campos del DTO
 */
export const EXCEL_COLUMN_TO_FIELD_MAP: Record<string, string> = {
  "UUID": "uuid",
  "Concepto": "concepto",
  "Subtotal": "subtotal",
  "Total": "total",
  "RFC Emisor": "rfcEmisor",
  "RFC Receptor": "rfcReceptor",
  "Serie": "serie",
  "Folio": "folio",
  "Impuestos Trasladados": "totalImpuestosTransladados",
  "Impuestos Retenidos": "totalImpuestosRetenidos",
  "Método Pago": "metodoPago",
  "Moneda": "moneda",
  "Uso CFDI": "usoCfdi",
  "Nombre Emisor": "nombreEmisor",
  "Nombre Receptor": "nombreReceptor",
  "Status Pago": "statusPago",
};
