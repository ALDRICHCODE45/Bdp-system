import { z } from "zod";

export const solicitarEdicionSchema = z.object({
  registroHoraId: z.string({ message: "El registro es requerido" }).uuid({
    message: "ID de registro inválido",
  }),
  justificacion: z
    .string({ message: "La justificación es requerida" })
    .min(10, { message: "La justificación debe tener al menos 10 caracteres" })
    .max(500, {
      message: "La justificación no puede superar los 500 caracteres",
    }),
});

export type SolicitarEdicionInput = z.infer<typeof solicitarEdicionSchema>;
