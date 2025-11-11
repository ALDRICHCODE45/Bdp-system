import z from "zod";

export const registrarSalidaSchema = z.object({
  hora_salida: z.coerce.date({
    message: "La hora de salida debe ser una fecha válida",
  }),
});

export type RegistrarSalidaSchema = z.infer<typeof registrarSalidaSchema>;

