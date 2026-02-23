import { z } from "zod";

export const updateFacturaSchemaUI = z.object({
  id: z.string().uuid("ID de factura inválido"),
  concepto: z.string().min(1, "El concepto es requerido"),
  serie: z.string().optional(),
  folio: z.string().optional(),
  subtotal: z.number().min(0, "El subtotal debe ser mayor o igual a 0"),
  totalImpuestosTransladados: z.number().optional(),
  totalImpuestosRetenidos: z.number().optional(),
  total: z.number().min(0, "El total debe ser mayor o igual a 0"),
  uuid: z.string().min(1, "El UUID es requerido"),
  rfcEmisor: z
    .string()
    .min(12, "El RFC emisor debe tener al menos 12 caracteres")
    .max(13, "El RFC emisor debe tener máximo 13 caracteres"),
  nombreReceptor: z.string().optional(),
  rfcReceptor: z
    .string()
    .min(12, "El RFC receptor debe tener al menos 12 caracteres")
    .max(13, "El RFC receptor debe tener máximo 13 caracteres"),
  metodoPago: z.string().optional(),
  moneda: z.string().min(1, "La moneda es requerida"),
  usoCfdi: z.string().optional(),
  status: z.enum(["borrador", "enviada", "pagada", "cancelada"], {
    message: "Status inválido",
  }),
  nombreEmisor: z.string().optional(),
  statusPago: z.string().optional(),
  fechaPago: z.string().optional(),
});

export type UpdateFacturaFormValues = z.infer<typeof updateFacturaSchemaUI>;
