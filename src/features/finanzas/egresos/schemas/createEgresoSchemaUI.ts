import { z } from "zod";

export const createEgresoSchemaUI = z.object({
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
  solicitante: z.enum(["rjs", "rgz", "calfc"], {
    message: "Solicitante inválido",
  }),
  autorizador: z.enum(["rjs", "rgz", "calfc"], {
    message: "Autorizador inválido",
  }),
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
  clienteProyecto: z.string().min(1, "El cliente/proyecto es requerido"),
  clienteProyectoId: z.string().uuid("ID de cliente/proyecto inválido"),
  notas: z.string().optional(),
});

export type CreateEgresoFormValues = z.infer<typeof createEgresoSchemaUI>;

