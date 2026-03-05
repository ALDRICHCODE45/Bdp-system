import { z } from "zod";

// ── Schema Zod de validación por fila ─────────────────────────────────────────

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
    .number({ error: "Debe ser un número válido" })
    .min(0, "Debe ser mayor o igual a 0"),

  total: z
    .number({ error: "Debe ser un número válido" })
    .min(0, "Debe ser mayor o igual a 0"),

  rfcEmisor: z
    .string()
    .min(12, "Debe tener al menos 12 caracteres")
    .max(13, "No puede superar 13 caracteres")
    .transform((val) => val.trim().toUpperCase()),

  rfcReceptor: z
    .string()
    .min(12, "Debe tener al menos 12 caracteres")
    .max(13, "No puede superar 13 caracteres")
    .transform((val) => val.trim().toUpperCase()),

  nombreEmisor: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val?.trim() || null)),

  nombreReceptor: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val?.trim() || null)),

  serie: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val?.trim() || null)),

  folio: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val?.trim() || null)),

  totalImpuestosTransladados: z.number().optional().nullable(),
  totalImpuestosRetenidos: z.number().optional().nullable(),

  metodoPago: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val?.trim() || null)),

  moneda: z
    .string()
    .optional()
    .nullable()
    .default("MXN")
    .transform((val) => val?.trim() || "MXN"),

  usoCfdi: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val?.trim() || null)),

  statusPago: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val?.trim() || null)),

  status: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null;
      const normalized = val.trim().toLowerCase();
      if (normalized === "vigente") return "VIGENTE";
      if (normalized === "cancelada" || normalized === "cancelado") return "CANCELADA";
      return null; // valor desconocido → usa el default del servicio
    }),

  iva: z.number().optional().nullable(),

  fechaEmision: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val?.trim() || null)),

  fechaPago: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val?.trim() || null)),

  facturaUrl: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val?.trim() || null)),
});

export type ImportFacturaExcelRowInput = z.infer<typeof importFacturaExcelRowSchema>;

// ── Normalización de headers ────────────────────────────────────────────────────

/**
 * Normaliza un texto de header para comparación insensible a mayúsculas,
 * acentos, espacios múltiples y caracteres especiales.
 *
 * "RFC Emisor" → "rfc emisor"
 * "Método Pago" → "metodo pago"
 * "Cliente/Proveedor" → "cliente/proveedor"
 */
export function normalizeColumnHeader(header: string): string {
  return String(header)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")               // colapsar espacios múltiples
    .normalize("NFD")                   // descomponer acentos
    .replace(/[\u0300-\u036f]/g, "")    // quitar marcas diacríticas
    .replace(/[_\-]/g, " ");            // guiones y underscores → espacio
}

// ── Mapa de aliases ─────────────────────────────────────────────────────────────

/**
 * Mapeo comprehensivo de nombres de columna normalizados → nombre de campo interno.
 *
 * Cubre variantes de nombres que aparecen en Excels reales de sistemas SAT,
 * ERP, contabilidad, etc. Siempre en minúsculas y sin acentos (post-normalize).
 */
export const COLUMN_ALIASES: Record<string, string> = {
  // ── UUID ──────────────────────────────────────────────────────────────────
  "uuid": "uuid",
  "uuid cfdi": "uuid",
  "folio uuid": "uuid",
  "folio fiscal": "uuid",
  "id fiscal": "uuid",
  "clave cfdi": "uuid",
  "timbre fiscal": "uuid",

  // ── Concepto ──────────────────────────────────────────────────────────────
  "concepto": "concepto",
  "descripcion": "concepto",
  "detalle": "concepto",
  "concepto o descripcion": "concepto",
  "concepto servicio": "concepto",
  "descripcion servicio": "concepto",
  "producto o servicio": "concepto",

  // ── Subtotal ──────────────────────────────────────────────────────────────
  "subtotal": "subtotal",
  "importe": "subtotal",
  "monto antes de iva": "subtotal",
  "importe antes de impuestos": "subtotal",
  "monto neto": "subtotal",
  "valor unitario": "subtotal",

  // ── Total ─────────────────────────────────────────────────────────────────
  "total": "total",
  "importe total": "total",
  "monto total": "total",
  "total factura": "total",
  "total a pagar": "total",
  "total comprobante": "total",

  // ── RFC Emisor ────────────────────────────────────────────────────────────
  "rfc emisor": "rfcEmisor",
  "rfc del emisor": "rfcEmisor",
  "emisor rfc": "rfcEmisor",
  "rfc empresa": "rfcEmisor",
  "rfc proveedor emisor": "rfcEmisor",

  // ── Nombre Emisor ─────────────────────────────────────────────────────────
  "nombre emisor": "nombreEmisor",
  "razon social emisor": "nombreEmisor",
  "empresa emisora": "nombreEmisor",
  "nombre empresa emisora": "nombreEmisor",
  "razon social": "nombreEmisor",           // cuando el emisor es siempre la misma empresa

  // ── RFC Receptor ──────────────────────────────────────────────────────────
  "rfc receptor": "rfcReceptor",
  "rfc del receptor": "rfcReceptor",
  "receptor rfc": "rfcReceptor",
  "rfc cliente": "rfcReceptor",             // muy común en Excels reales
  "rfc del cliente": "rfcReceptor",
  "rfc proveedor": "rfcReceptor",
  "rfc proveedor receptor": "rfcReceptor",

  // ── Nombre Receptor ───────────────────────────────────────────────────────
  "nombre receptor": "nombreReceptor",
  "razon social receptor": "nombreReceptor",
  "cliente/proveedor": "nombreReceptor",    // muy común en Excels reales
  "cliente": "nombreReceptor",
  "nombre cliente": "nombreReceptor",
  "razon social cliente": "nombreReceptor",
  "receptor": "nombreReceptor",
  "proveedor": "nombreReceptor",
  "nombre proveedor": "nombreReceptor",
  "empresa receptora": "nombreReceptor",

  // ── Serie ─────────────────────────────────────────────────────────────────
  "serie": "serie",
  "serie comprobante": "serie",
  "serie cfdi": "serie",

  // ── Folio ─────────────────────────────────────────────────────────────────
  "folio": "folio",
  "numero folio": "folio",
  "numero de folio": "folio",
  "folio comprobante": "folio",
  "no folio": "folio",
  "num folio": "folio",

  // ── Impuestos Trasladados ─────────────────────────────────────────────────
  "impuestos trasladados": "totalImpuestosTransladados",
  "total impuestos trasladados": "totalImpuestosTransladados",
  "imp trasladados": "totalImpuestosTransladados",
  "iva trasladado": "totalImpuestosTransladados",
  "iva": "totalImpuestosTransladados",
  "iva cobrado": "totalImpuestosTransladados",
  "impuesto al valor agregado": "totalImpuestosTransladados",
  "impuestos traslados": "totalImpuestosTransladados",
  "traslados": "totalImpuestosTransladados",

  // ── Impuestos Retenidos ───────────────────────────────────────────────────
  "impuestos retenidos": "totalImpuestosRetenidos",
  "total impuestos retenidos": "totalImpuestosRetenidos",
  "imp retenidos": "totalImpuestosRetenidos",
  "iva retenido": "totalImpuestosRetenidos",
  "retenciones": "totalImpuestosRetenidos",
  "retencion iva": "totalImpuestosRetenidos",
  "isr retenido": "totalImpuestosRetenidos",

  // ── Método Pago ───────────────────────────────────────────────────────────
  "metodo pago": "metodoPago",
  "metodo de pago": "metodoPago",
  "forma pago": "metodoPago",
  "forma de pago": "metodoPago",
  "tipo pago": "metodoPago",
  "tipo de pago": "metodoPago",
  "clave metodo pago": "metodoPago",

  // ── Moneda ────────────────────────────────────────────────────────────────
  "moneda": "moneda",
  "tipo moneda": "moneda",
  "tipo de moneda": "moneda",
  "divisa": "moneda",
  "clave moneda": "moneda",

  // ── Uso CFDI ─────────────────────────────────────────────────────────────
  "uso cfdi": "usoCfdi",
  "uso del cfdi": "usoCfdi",
  "clave uso cfdi": "usoCfdi",
  "uso": "usoCfdi",

  // ── Status Pago ───────────────────────────────────────────────────────────
  "status pago": "statusPago",
  "estatus pago": "statusPago",
  "estado pago": "statusPago",
  "estado de pago": "statusPago",
  "estatus de pago": "statusPago",
  "estatus": "statusPago",

  // ── Status (vigente/cancelada) ────────────────────────────────────────────
  "status": "status",
  "estatus factura": "status",
  "estado factura": "status",
  "status cfdi": "status",

  // ── IVA ───────────────────────────────────────────────────────────────────
  "iva monto": "iva",
  "monto iva": "iva",
  "valor iva": "iva",
  // nota: "iva" solo ya está mapeado a totalImpuestosTransladados (alias histórico)
  // usamos "iva monto" para el campo específico

  // ── Fecha Emisión ─────────────────────────────────────────────────────────
  "fecha emision": "fechaEmision",
  "fecha de emision": "fechaEmision",
  "fecha timbrado": "fechaEmision",
  "fecha cfdi": "fechaEmision",
  "fecha expedicion": "fechaEmision",
  "fecha de expedicion": "fechaEmision",

  // ── Fecha Pago ────────────────────────────────────────────────────────────
  "fecha pago": "fechaPago",
  "fecha de pago": "fechaPago",
  "fecha cobro": "fechaPago",
  "fecha de cobro": "fechaPago",

  // ── Factura URL ───────────────────────────────────────────────────────────
  "factura url": "facturaUrl",
  "url factura": "facturaUrl",
  "url pdf": "facturaUrl",
  "pdf timbrado": "facturaUrl",
  "url timbrado": "facturaUrl",
  "enlace pdf": "facturaUrl",
  "factura sat": "facturaUrl",
};

// ── Campos requeridos internos ────────────────────────────────────────────────

export const REQUIRED_FIELDS = [
  "uuid",
  "concepto",
  "subtotal",
  "total",
  "rfcEmisor",
  "rfcReceptor",
] as const;

// ── Labels en español para mensajes de error ──────────────────────────────────

export const FIELD_TO_LABEL: Record<string, string> = {
  uuid: "UUID",
  concepto: "Concepto",
  subtotal: "Subtotal",
  total: "Total",
  rfcEmisor: "RFC Emisor",
  rfcReceptor: "RFC Receptor",
  nombreEmisor: "Nombre Emisor",
  nombreReceptor: "Nombre Receptor",
  serie: "Serie",
  folio: "Folio",
  totalImpuestosTransladados: "Impuestos Trasladados",
  totalImpuestosRetenidos: "Impuestos Retenidos",
  metodoPago: "Método Pago",
  moneda: "Moneda",
  usoCfdi: "Uso CFDI",
  statusPago: "Status Pago",
  status: "Status",
  iva: "IVA Monto",
  fechaEmision: "Fecha Emisión",
  fechaPago: "Fecha Pago",
  facturaUrl: "Factura URL",
};

// ── Backward compat (usado por generateExcelTemplate.ts) ─────────────────────

export const REQUIRED_EXCEL_COLUMNS = [
  "UUID",
  "Concepto",
  "Subtotal",
  "Total",
  "RFC Emisor",
  "RFC Receptor",
] as const;

export const OPTIONAL_EXCEL_COLUMNS = [
  "Serie",
  "Folio",
  "Status",
  "IVA Monto",
  "Impuestos Trasladados",
  "Impuestos Retenidos",
  "Método Pago",
  "Moneda",
  "Uso CFDI",
  "Nombre Emisor",
  "Nombre Receptor",
  "Status Pago",
  "Fecha Emisión",
  "Fecha Pago",
  "Factura URL",
] as const;

export const ALL_EXCEL_COLUMNS = [
  ...REQUIRED_EXCEL_COLUMNS,
  ...OPTIONAL_EXCEL_COLUMNS,
] as const;

export const EXCEL_COLUMN_TO_FIELD_MAP: Record<string, string> = {
  "UUID": "uuid",
  "Concepto": "concepto",
  "Subtotal": "subtotal",
  "Total": "total",
  "RFC Emisor": "rfcEmisor",
  "RFC Receptor": "rfcReceptor",
  "Serie": "serie",
  "Folio": "folio",
  "Status": "status",
  "IVA Monto": "iva",
  "Impuestos Trasladados": "totalImpuestosTransladados",
  "Impuestos Retenidos": "totalImpuestosRetenidos",
  "Método Pago": "metodoPago",
  "Moneda": "moneda",
  "Uso CFDI": "usoCfdi",
  "Nombre Emisor": "nombreEmisor",
  "Nombre Receptor": "nombreReceptor",
  "Status Pago": "statusPago",
  "Fecha Emisión": "fechaEmision",
  "Fecha Pago": "fechaPago",
  "Factura URL": "facturaUrl",
};
