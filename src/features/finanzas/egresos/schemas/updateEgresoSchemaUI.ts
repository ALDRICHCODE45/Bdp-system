import { z } from "zod";

export const updateEgresoSchemaUI = z
  .object({
    id: z.string().uuid("ID de egreso inválido"),
    concepto: z.string().min(1, "El concepto es requerido"),
    clasificacion: z.enum(
      [
        "gasto op",
        "honorarios",
        "servicios",
        "arrendamiento",
        "comisiones",
        "disposición",
      ],
      {
        message: "Clasificación inválida",
      }
    ),
    categoria: z.enum(
      ["facturación", "comisiones", "disposición", "bancarizaciones"],
      {
        message: "Categoría inválida",
      }
    ),
  proveedor: z.string().min(1, "El proveedor es requerido"),
  proveedorId: z.string().uuid("ID de proveedor inválido"),
  solicitante: z.string().min(1, "El nombre del solicitante es requerido"),
  solicitanteId: z.string().min(1, "El ID del solicitante es requerido"),
  autorizador: z.string().min(1, "El nombre del autorizador es requerido"),
  autorizadorId: z.string().min(1, "El ID del autorizador es requerido"),
  numeroFactura: z.string().min(1, "El número de factura es requerido"),
    folioFiscal: z.string().min(1, "El folio fiscal es requerido"),
    periodo: z
      .string()
      .regex(/^\d{4}-\d{2}$/, "El periodo debe tener el formato YYYY-MM"),
    formaPago: z.enum(["transferencia", "efectivo", "cheque"], {
      message: "Forma de pago inválida",
    }),
    origen: z.string().min(1, "El origen es requerido"),
    numeroCuenta: z.string().min(1, "El número de cuenta es requerido"),
    clabe: z
      .string()
      .refine(
        (val) => !val || (val.length === 18 && /^\d{18}$/.test(val)),
        "La CLABE debe tener exactamente 18 dígitos"
      ),
    cargoAbono: z.enum(["bdp", "calfc", "global", "rjz", "app"], {
      message: "Cargo/Abono inválido",
    }),
    cantidad: z.number().positive("La cantidad debe ser mayor a 0"),
    estado: z.enum(["pagado", "pendiente", "cancelado"], {
      message: "Estado inválido",
    }),
    fechaPago: z.string().optional(),
    fechaRegistro: z.string().min(1, "La fecha de registro es requerida"),
    facturadoPor: z.enum(["bdp", "calfc", "global", "rgz", "rjs", "app"], {
      message: "Facturado por inválido",
    }),
    clienteProyecto: z
      .union([
        z.string().trim().min(1, "El cliente/proyecto es requerido"),
        z.literal(""),
      ])
      .optional(),
    clienteProyectoId: z
      .union([
        z.string().uuid("ID de cliente/proyecto inválido"),
        z.literal(""),
      ])
      .optional(),
    notas: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasNombre =
      typeof data.clienteProyecto === "string" &&
      data.clienteProyecto.trim().length > 0;
    const hasId =
      typeof data.clienteProyectoId === "string" &&
      data.clienteProyectoId.trim().length > 0;

    if (hasNombre !== hasId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Selecciona un cliente/proyecto válido o deja ambos campos vacíos",
        path: hasNombre ? ["clienteProyectoId"] : ["clienteProyecto"],
      });
    }
  });

export type UpdateEgresoFormValues = z.infer<typeof updateEgresoSchemaUI>;

