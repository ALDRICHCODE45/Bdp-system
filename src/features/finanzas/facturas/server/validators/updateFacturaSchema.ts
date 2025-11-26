import { z } from "zod";

export const updateFacturaSchema = z.object({
  id: z.string().uuid(),
  tipoOrigen: z.enum(["INGRESO", "EGRESO"]),
  origenId: z.string().uuid(),
  clienteProveedorId: z.string().uuid(),
  clienteProveedor: z.string().min(1, "El cliente/proveedor es requerido"),
  concepto: z.string().min(1, "El concepto es requerido"),
  monto: z.number().positive("El monto debe ser mayor a 0"),
  periodo: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "El periodo debe tener el formato YYYY-MM"),
  numeroFactura: z.string().min(1, "El número de factura es requerido"),
  folioFiscal: z.string().min(1, "El folio fiscal es requerido"),
  fechaEmision: z.date(),
  fechaVencimiento: z.date(),
  estado: z.enum(["BORRADOR", "ENVIADA", "PAGADA", "CANCELADA"]),
  formaPago: z.enum(["TRANSFERENCIA", "EFECTIVO", "CHEQUE"]),
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
  numeroCuenta: z.string().min(1, "El número de cuenta es requerido"),
  clabe: z
    .string()
    .min(18, "La CLABE debe tener 18 dígitos")
    .max(18, "La CLABE debe tener 18 dígitos"),
  banco: z.string().min(1, "El banco es requerido"),
  fechaPago: z.date().optional().nullable(),
  fechaRegistro: z.date(),
  creadoPor: z.string().min(1, "El nombre del creador es requerido"),
  creadoPorId: z.string().uuid("ID de creador inválido"),
  autorizadoPor: z.string().min(1, "El nombre del autorizador es requerido"),
  autorizadoPorId: z.string().uuid("ID de autorizador inválido"),
  notas: z.string().optional().nullable(),
});

export type UpdateFacturaInput = z.infer<typeof updateFacturaSchema>;

