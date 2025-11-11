import z from "zod";

export const createEntradasSalidasSchema = z.object({
  visitante: z.string().min(3, "El visitante es requerido"),
  destinatario: z.string().min(3, "El destinatario es requerido"),
  motivo: z.string().min(2, "El motivo es requerido"),
  telefono: z.string().nullable().optional(),
  correspondencia: z.string().nullable().optional(),
  fecha: z.coerce.date({
    message: "La fecha debe ser una fecha válida",
  }),
  hora_entrada: z.coerce.date({
    message: "La hora de entrada debe ser una fecha válida",
  }),
  hora_salida: z.coerce.date({
    message: "La hora de salida debe ser una fecha válida",
  }),
});

export type CreateEntradasSalidasSchema = z.infer<
  typeof createEntradasSalidasSchema
>;
