import { z } from "zod";

export const updateIngresoSchema = z.object({
  concepto: z.string().min(1, "El concepto es requerido"),
  cliente: z.string().min(1, "El cliente es requerido"),
  clienteId: z.string().uuid("ID de cliente inválido"),
  solicitante: z.enum(["RJS", "RGZ", "CALFC"], {
    message: "Solicitante inválido",
  }),
  autorizador: z.enum(["RJS", "RGZ", "CALFC"], {
    message: "Autorizador inválido",
  }),
  numeroFactura: z.string().min(1, "El número de factura es requerido"),
  folioFiscal: z.string().min(1, "El folio fiscal es requerido"),
  periodo: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "El periodo debe tener el formato YYYY-MM"),
  formaPago: z.enum(["TRANSFERENCIA", "EFECTIVO", "CHEQUE"], {
    message: "Forma de pago inválida",
  }),
  origen: z.string().min(1, "El origen es requerido"),
  numeroCuenta: z.string().min(1, "El número de cuenta es requerido"),
  clabe: z
    .string()
    .length(18, "La CLABE debe tener exactamente 18 dígitos")
    .regex(/^\d{18}$/, "La CLABE debe contener solo números"),
  cargoAbono: z.enum(["BDP", "CALFC"], {
    message: "Cargo/Abono inválido",
  }),
  cantidad: z.number().positive("La cantidad debe ser mayor a 0"),
  estado: z.enum(["PAGADO", "PENDIENTE", "CANCELADO"], {
    message: "Estado inválido",
  }),
  fechaPago: z.date().optional().nullable(),
  fechaRegistro: z.date(),
  facturadoPor: z.enum(["BDP", "CALFC", "GLOBAL", "RGZ", "RJS", "APP"], {
    message: "Facturado por inválido",
  }),
  clienteProyecto: z.string().min(1, "El cliente/proyecto es requerido"),
  fechaParticipacion: z.date().optional().nullable(),
  notas: z.string().optional().nullable(),
});

export type UpdateIngresoSchema = z.infer<typeof updateIngresoSchema>;

