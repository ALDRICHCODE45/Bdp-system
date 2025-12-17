import { z } from "zod";

/**
 * Schema de validación para una fila del archivo Excel de importación.
 * Este schema valida los datos crudos extraídos del Excel.
 */
export const importFacturaExcelRowSchema = z.object({
  numeroFactura: z
    .string()
    .min(1, "El número de factura es requerido")
    .transform((val) => val.trim()),

  folioFiscal: z
    .string()
    .min(1, "El folio fiscal es requerido")
    .transform((val) => val.trim()),

  clienteProveedor: z
    .string()
    .min(1, "El nombre del cliente/proveedor es requerido")
    .transform((val) => val.trim()),

  rfcClienteProveedor: z
    .string()
    .min(12, "El RFC debe tener al menos 12 caracteres")
    .max(13, "El RFC debe tener máximo 13 caracteres")
    .transform((val) => val.trim().toUpperCase()),

  concepto: z
    .string()
    .min(1, "El concepto es requerido")
    .transform((val) => val.trim()),

  monto: z
    .number({ message: "El monto debe ser un numero" })
    .positive("El monto debe ser mayor a 0"),

  periodo: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "El periodo debe tener el formato YYYY-MM"),

  fechaEmision: z
    .date({ message: "La fecha de emisión no es válida" }),

  fechaVencimiento: z
    .date({ message: "La fecha de vencimiento no es válida" }),

  formaPago: z
    .enum(["TRANSFERENCIA", "EFECTIVO", "CHEQUE"], {
      message: "Forma de pago inválida. Use: TRANSFERENCIA, EFECTIVO o CHEQUE",
    }),

  rfcEmisor: z
    .string()
    .min(12, "El RFC emisor debe tener al menos 12 caracteres")
    .max(13, "El RFC emisor debe tener máximo 13 caracteres")
    .transform((val) => val.trim().toUpperCase()),

  rfcReceptor: z
    .string()
    .min(12, "El RFC receptor debe tener al menos 12 caracteres")
    .max(13, "El RFC receptor debe tener máximo 13 caracteres")
    .transform((val) => val.trim().toUpperCase()),

  direccionEmisor: z
    .string()
    .default("")
    .transform((val) => val.trim()),

  direccionReceptor: z
    .string()
    .default("")
    .transform((val) => val.trim()),

  numeroCuenta: z
    .string()
    .default("")
    .transform((val) => val.trim()),

  clabe: z
    .string()
    .refine(
      (val) => val === "" || val.length === 18,
      "La CLABE debe tener exactamente 18 dígitos o estar vacía"
    )
    .default("")
    .transform((val) => val.trim()),

  banco: z
    .string()
    .default("")
    .transform((val) => val.trim()),

  notas: z
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
  "Número de Factura": z.string(),
  "Folio Fiscal": z.string(),
  "Cliente/Proveedor": z.string(),
  "RFC Cliente": z.string(),
  "Concepto": z.string(),
  "Monto": z.string(),
  "Periodo": z.string(),
  "Fecha Emisión": z.string(),
  "Fecha Vencimiento": z.string(),
  "Forma de Pago": z.string(),
  "RFC Emisor": z.string(),
  "RFC Receptor": z.string(),
});

/**
 * Columnas requeridas del Excel
 */
export const REQUIRED_EXCEL_COLUMNS = [
  "Número de Factura",
  "Folio Fiscal",
  "Cliente/Proveedor",
  "RFC Cliente",
  "Concepto",
  "Monto",
  "Periodo",
  "Fecha Emisión",
  "Fecha Vencimiento",
  "Forma de Pago",
  "RFC Emisor",
  "RFC Receptor",
] as const;

/**
 * Columnas opcionales del Excel
 */
export const OPTIONAL_EXCEL_COLUMNS = [
  "Dirección Emisor",
  "Dirección Receptor",
  "Número Cuenta",
  "CLABE",
  "Banco",
  "Notas",
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
  "Número de Factura": "numeroFactura",
  "Folio Fiscal": "folioFiscal",
  "Cliente/Proveedor": "clienteProveedor",
  "RFC Cliente": "rfcClienteProveedor",
  "Concepto": "concepto",
  "Monto": "monto",
  "Periodo": "periodo",
  "Fecha Emisión": "fechaEmision",
  "Fecha Vencimiento": "fechaVencimiento",
  "Forma de Pago": "formaPago",
  "RFC Emisor": "rfcEmisor",
  "RFC Receptor": "rfcReceptor",
  "Dirección Emisor": "direccionEmisor",
  "Dirección Receptor": "direccionReceptor",
  "Número Cuenta": "numeroCuenta",
  "CLABE": "clabe",
  "Banco": "banco",
  "Notas": "notas",
};
