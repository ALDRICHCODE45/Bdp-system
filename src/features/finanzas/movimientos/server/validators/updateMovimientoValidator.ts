import { z } from "zod";

/**
 * Server-side Zod schema for updating a Movimiento.
 *
 * All fields optional (partial update).
 * Forbids changing `tipo` and `dedupHash` to prevent dedup integrity break.
 */
export const updateMovimientoValidator = z
  .object({
    id: z.string().uuid("ID de movimiento invalido"),

    titular: z
      .string()
      .min(1, "El titular es requerido")
      .transform((val) => val.trim())
      .optional(),

    estadoCuenta: z
      .string()
      .min(1, "El estado de cuenta es requerido")
      .transform((val) => val.trim())
      .optional(),

    fechaCorte: z.coerce
      .date({
        message: "La fecha de corte debe ser una fecha valida",
      })
      .optional(),

    fechaOperacion: z.coerce
      .date({
        message: "La fecha de operacion debe ser una fecha valida",
      })
      .optional(),

    descripcionLiteral: z
      .string()
      .min(1, "La descripcion literal es requerida")
      .transform((val) => val.trim())
      .optional(),

    monto: z
      .number({ message: "El monto debe ser un numero valido" })
      .positive("El monto debe ser mayor a 0")
      .optional(),

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

    estado: z.enum(["PAGADO", "PENDIENTE", "CANCELADO"]).optional(),
  })
  .refine(
    (data) => {
      // Forbid tipo and dedupHash from appearing in update payload
      const forbidden = Object.keys(data).filter((k) =>
        ["tipo", "dedupHash"].includes(k)
      );
      return forbidden.length === 0;
    },
    {
      message:
        "No se puede cambiar el tipo ni el dedupHash de un movimiento existente",
    }
  );

export type UpdateMovimientoInput = z.infer<typeof updateMovimientoValidator>;
