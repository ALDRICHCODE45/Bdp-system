import { z } from "zod";

/**
 * Client-side Zod schema for the create movimiento form.
 *
 * Both INGRESO and EGRESO forms feed into this single schema
 * with `tipo` as a discriminator. The form-level schema is permissive
 * on date format (accepts both Date object and ISO string via coerce).
 */
export const createMovimientoSchema = z.object({
  tipo: z.enum(["INGRESO", "EGRESO"], {
    message: "Selecciona el tipo de movimiento",
  }),

  titular: z.string().min(1, "El titular es requerido"),

  estadoCuenta: z.string().min(1, "El estado de cuenta es requerido"),

  fechaCorte: z.string().min(1, "La fecha de corte es requerida"),

  fechaOperacion: z.string().min(1, "La fecha de operacion es requerida"),

  descripcionLiteral: z
    .string()
    .min(1, "La descripcion literal es requerida"),

  monto: z.number().positive("El monto debe ser mayor a 0"),

  // Optional fields
  concepto: z.string().optional(),
  descripcionAdministracion: z.string().optional(),
  categoria: z.string().optional(),
  formaPago: z.string().optional(),
  cargoAbono: z.string().optional(),
  facturadoPor: z.string().optional(),
  periodo: z.string().optional(),
  numeroFactura: z.string().optional(),
  folioFiscal: z.string().optional(),
  proveedor: z.string().optional(),
  proveedorId: z.string().optional(),
  cliente: z.string().optional(),
  clienteId: z.string().optional(),
  solicitanteId: z.string().optional(),
  autorizadorId: z.string().optional(),
  notas: z.string().optional(),
  facturaId: z.string().optional(),
  estado: z.enum(["PAGADO", "PENDIENTE", "CANCELADO"]).optional(),
});

export type CreateMovimientoFormValues = z.infer<
  typeof createMovimientoSchema
>;
