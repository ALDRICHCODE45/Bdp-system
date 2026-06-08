import { z } from "zod";

/**
 * Client-side Zod schema for the update movimiento form.
 *
 * Requires the movimiento ID. All other fields optional.
 * `tipo` is NOT included — it cannot be changed after creation.
 */
export const updateMovimientoSchema = z.object({
  id: z.string().uuid("ID de movimiento invalido"),

  titular: z.string().min(1, "El titular es requerido").optional(),

  estadoCuenta: z
    .string()
    .min(1, "El estado de cuenta es requerido")
    .optional(),

  fechaCorte: z.string().optional(),

  fechaOperacion: z.string().optional(),

  descripcionLiteral: z
    .string()
    .min(1, "La descripcion literal es requerida")
    .optional(),

  monto: z.number().positive("El monto debe ser mayor a 0").optional(),

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

export type UpdateMovimientoFormValues = z.infer<
  typeof updateMovimientoSchema
>;
