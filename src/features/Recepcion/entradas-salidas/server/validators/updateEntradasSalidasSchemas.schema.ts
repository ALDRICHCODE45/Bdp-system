import z from "zod";

export const updateEntradasSalidasSchema = z.object({
  visitante: z.string().min(3, "El visitante es requerido").optional(),
  destinatario: z.string().min(3, "El destinatario es requerido").optional(),
  motivo: z.string().min(2, "El motivo es requerido").optional(),
  telefono: z.string().nullable().optional(),
  correspondencia: z.string().nullable().optional(),
  fecha: z.coerce
    .date({
      message: "La fecha debe ser una fecha válida",
    })
    .optional(),
  hora_entrada: z.coerce
    .date({
      message: "La hora de entrada debe ser una fecha válida",
    })
    .optional(),
  hora_salida: z.coerce
    .date({
      message: "La hora de salida debe ser una fecha válida",
    })
    .optional(),
});

export type UpdateEntradasSalidasSchema = z.infer<
  typeof updateEntradasSalidasSchema
>;

