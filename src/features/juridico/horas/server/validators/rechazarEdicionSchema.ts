import { z } from "zod";

export const rechazarEdicionSchema = z.object({
  autorizacionId: z
    .string({ message: "El ID de la solicitud es requerido" })
    .uuid({ message: "ID de solicitud inválido" }),
  motivoRechazo: z
    .string({ message: "El motivo de rechazo es requerido" })
    .min(5, { message: "El motivo debe tener al menos 5 caracteres" })
    .max(500, { message: "El motivo no puede superar los 500 caracteres" }),
});

export type RechazarEdicionInput = z.infer<typeof rechazarEdicionSchema>;
