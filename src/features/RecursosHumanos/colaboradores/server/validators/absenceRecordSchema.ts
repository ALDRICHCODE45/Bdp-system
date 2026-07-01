import { z } from "zod";

/**
 * Zod validator for an AbsenceRecord create payload (cap9 req3).
 *
 * Spec cap9 req3:
 *  - `tipo` is the `AusenciaTipo` enum: VACACIONES | LICENCIA | INCAPACIDAD.
 *  - `fechaInicio` / `fechaFin` are DateTime inputs (ISO strings on the wire).
 *  - `dias` is Int, computed by the SERVICE as `fechaFin - fechaInicio + 1`
 *    (calendar days, inclusive) — the validator accepts the server-computed
 *    value but the SERVICE is the source of truth for that math (see
 *    `AbsenceRecordService.create`). Rejecting inverted ranges
 *    (`fechaFin < fechaInicio`) is a service-layer concern too; the schema
 *    only validates the SHAPE.
 *  - `motivo` is OPTIONAL free-text.
 *  - `colaboradorId` and `registradoPorId` are validated at the action
 *    boundary (registradoPorId is taken from the session, not the payload).
 *
 * The dates are validated as ISO strings so the FormData bridge can parse
 * them with `new Date(...)` upstream; the service converts to a real Date
 * before computing `dias`.
 */
export const absenceRecordSchema = z
  .object({
    tipo: z.enum(["VACACIONES", "LICENCIA", "INCAPACIDAD"], {
      error: "Tipo de ausencia inválido",
    }),
    fechaInicio: z
      .string()
      .datetime({ message: "Fecha de inicio inválida" })
      .or(z.string().date({ message: "Fecha de inicio inválida" })),
    fechaFin: z
      .string()
      .datetime({ message: "Fecha de fin inválida" })
      .or(z.string().date({ message: "Fecha de fin inválida" })),
    dias: z
      .number()
      .int("Los días deben ser un número entero")
      .min(1, "Los días deben ser al menos 1")
      .max(366, "Los días no pueden exceder un año"),
    motivo: z
      .string()
      .trim()
      .max(500, "El motivo no puede exceder 500 caracteres")
      .optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.fechaInicio).getTime();
      const end = new Date(data.fechaFin).getTime();
      return Number.isFinite(start) && Number.isFinite(end) && end >= start;
    },
    {
      message: "La fecha de fin no puede ser anterior a la fecha de inicio",
      path: ["fechaFin"],
    }
  );

export type AbsenceRecordSchema = z.infer<typeof absenceRecordSchema>;