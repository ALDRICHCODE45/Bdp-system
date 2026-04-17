import { z } from "zod";

// NOTE: ano, semana, usuarioId are NOT in the schema — they're auto-populated server-side
export const createRegistroHoraSchema = z
  .object({
    equipoJuridicoId: z.string().uuid({ message: "Equipo inválido" }),
    clienteJuridicoId: z.string().uuid({ message: "Cliente inválido" }),
    asuntoJuridicoId: z.string().uuid({ message: "Asunto inválido" }),
    socioId: z.string().uuid({ message: "Socio inválido" }),
    horas: z
      .number({ message: "Las horas deben ser un número" })
      .min(0, { message: "Las horas no pueden ser negativas" })
      .max(24, { message: "Máximo 24 horas" }),
    minutos: z
      .number({ message: "Los minutos deben ser un número" })
      .min(0, { message: "Los minutos no pueden ser negativos" })
      .max(55, { message: "Máximo 55 minutos" })
      .multipleOf(5, { message: "Los minutos deben ser múltiplos de 5" }),
    descripcion: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // Total mínimo: 5 minutos
    const totalMinutes = data.horas * 60 + data.minutos;
    if (totalMinutes < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El tiempo mínimo es 5 minutos",
        path: ["minutos"],
      });
    }
    // Si horas=24, minutos debe ser 0
    if (data.horas === 24 && data.minutos !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Si son 24 horas, los minutos deben ser 0",
        path: ["minutos"],
      });
    }
  });

export type CreateRegistroHoraServerInput = z.infer<
  typeof createRegistroHoraSchema
>;
