import { z } from "zod";

export const createFacturaSchema = z.object({
  concepto: z.string().min(1, "El concepto es requerido"),
  serie: z.string().nullable().optional(),
  folio: z.string().nullable().optional(),
  fechaEmision: z.date().optional().nullable(),
  subtotal: z.number().nonnegative("El subtotal debe ser mayor o igual a 0"),
  iva: z.number().nonnegative().nullable().optional(),
  totalImpuestosTransladados: z.number().nullable().optional(),
  totalImpuestosRetenidos: z.number().nullable().optional(),
  total: z.number().nonnegative("El total debe ser mayor o igual a 0"),
  uuid: z.string().min(1, "El UUID es requerido"),
  rfcEmisor: z
    .string()
    .min(12, "El RFC emisor debe tener al menos 12 caracteres")
    .max(13, "El RFC emisor debe tener maximo 13 caracteres"),
  nombreReceptor: z.string().optional().nullable(),
  rfcReceptor: z
    .string()
    .min(12, "El RFC receptor debe tener al menos 12 caracteres")
    .max(13, "El RFC receptor debe tener maximo 13 caracteres"),
  metodoPago: z.string().nullable().optional(),
  moneda: z.string().optional().default("MXN"),
  usoCfdi: z.string().nullable().optional(),
  status: z.enum(["VIGENTE", "CANCELADA"]),
  nombreEmisor: z.string().nullable().optional(),
  statusPago: z.string().nullable().optional(),
  fechaPago: z.date().optional().nullable(),
  facturaUrl: z.string().url().nullable().optional(),
});

export type CreateFacturaInput = z.infer<typeof createFacturaSchema>;
