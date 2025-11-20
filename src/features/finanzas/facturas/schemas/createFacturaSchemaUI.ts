import { z } from "zod";

export const createFacturaSchemaUI = z.object({
  tipoOrigen: z.enum(["ingreso", "egreso"], {
    message: "Tipo de origen inválido",
  }),
  origenId: z.string().uuid("ID de origen inválido"),
  clienteProveedorId: z.string().uuid("ID de cliente/proveedor inválido"),
  clienteProveedor: z.string().min(1, "El cliente/proveedor es requerido"),
  concepto: z.string().min(1, "El concepto es requerido"),
  monto: z.number().positive("El monto debe ser mayor a 0"),
  periodo: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "El periodo debe tener el formato YYYY-MM"),
  numeroFactura: z.string().min(1, "El número de factura es requerido"),
  folioFiscal: z.string().min(1, "El folio fiscal es requerido"),
  fechaEmision: z.string().min(1, "La fecha de emisión es requerida"),
  fechaVencimiento: z.string().min(1, "La fecha de vencimiento es requerida"),
  estado: z.enum(["borrador", "enviada", "pagada", "cancelada"], {
    message: "Estado inválido",
  }),
  formaPago: z.enum(["transferencia", "efectivo", "cheque"], {
    message: "Forma de pago inválida",
  }),
  rfcEmisor: z
    .string()
    .min(12, "El RFC emisor debe tener al menos 12 caracteres")
    .max(13, "El RFC emisor debe tener máximo 13 caracteres"),
  rfcReceptor: z
    .string()
    .min(12, "El RFC receptor debe tener al menos 12 caracteres")
    .max(13, "El RFC receptor debe tener máximo 13 caracteres"),
  direccionEmisor: z.string().min(1, "La dirección del emisor es requerida"),
  direccionReceptor: z
    .string()
    .min(1, "La dirección del receptor es requerida"),
  fechaPago: z.string().optional(),
  fechaRegistro: z.string().min(1, "La fecha de registro es requerida"),
  creadoPor: z.string().min(1, "El creador es requerido"),
  autorizadoPor: z.string().min(1, "El autorizador es requerido"),
  notas: z.string().optional(),
  archivoPdf: z.string().optional(),
  archivoXml: z.string().optional(),
});

export type CreateFacturaFormValues = z.infer<typeof createFacturaSchemaUI>;

