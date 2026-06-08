import { z } from "zod";

/**
 * Server-side Zod schema for creating a Movimiento.
 *
 * Required: tipo, titular, estadoCuenta, fechaCorte, fechaOperacion,
 * descripcionLiteral, monto.
 * Optional: all other fields per design D3.
 * dedupHash is auto-computed by the service — NOT user input.
 */
export const createMovimientoValidator = z.object({
  tipo: z.enum(["INGRESO", "EGRESO"], {
    message: "El tipo debe ser INGRESO o EGRESO",
  }),

  titular: z
    .string()
    .min(1, "El titular es requerido")
    .transform((val) => val.trim()),

  estadoCuenta: z
    .string()
    .min(1, "El estado de cuenta es requerido")
    .transform((val) => val.trim()),

  fechaCorte: z.coerce.date({
    message: "La fecha de corte debe ser una fecha valida",
  }),

  fechaOperacion: z.coerce.date({
    message: "La fecha de operacion debe ser una fecha valida",
  }),

  descripcionLiteral: z
    .string()
    .min(1, "La descripcion literal es requerida")
    .transform((val) => val.trim()),

  monto: z
    .number({ message: "El monto debe ser un numero valido" })
    .positive("El monto debe ser mayor a 0"),

  // Optional fields
  concepto: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val?.trim() || null),

  descripcionAdministracion: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val?.trim() || null),

  categoria: z
    .enum([
      "FACTURACION",
      "COMISIONES",
      "DISPOSICION",
      "BANCARIZACIONES",
      "GASTO_OP",
      "HONORARIOS",
      "SERVICIOS",
      "ARRENDAMIENTO",
    ])
    .nullable()
    .optional(),

  formaPago: z
    .enum(["TRANSFERENCIA", "EFECTIVO", "CHEQUE"])
    .nullable()
    .optional(),

  cargoAbono: z
    .enum(["BDP", "CALFC", "GLOBAL", "RJZ", "APP"])
    .nullable()
    .optional(),

  facturadoPor: z
    .enum(["BDP", "CALFC", "GLOBAL", "RGZ", "RJS", "APP"])
    .nullable()
    .optional(),

  periodo: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val?.trim() || null),

  numeroFactura: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val?.trim() || null),

  folioFiscal: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val?.trim() || null),

  proveedor: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val?.trim() || null),

  proveedorId: z.string().uuid().nullable().optional(),

  cliente: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val?.trim() || null),

  clienteId: z.string().uuid().nullable().optional(),

  solicitanteId: z.string().uuid().nullable().optional(),
  autorizadorId: z.string().uuid().nullable().optional(),

  notas: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val?.trim() || null),

  facturaId: z.string().uuid().nullable().optional(),

  estado: z.enum(["PAGADO", "PENDIENTE", "CANCELADO"]).optional().default("PAGADO"),
});

export type CreateMovimientoInput = z.infer<typeof createMovimientoValidator>;
