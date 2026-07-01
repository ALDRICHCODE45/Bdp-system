import { z } from "zod";

/**
 * Zod validator for the position-adjust payload (cap6 req5 + cap5 req6).
 *
 * - `fechaEfectiva` — required ISO date string.
 * - `cargo` — required free-text (matches the `puesto` column semantics;
 *   spec uses `cargo` as the UI label but the underlying field stays
 *   `puesto`).
 * - `departamento` — optional free-text.
 * - `nivel` — optional enum value (JUNIOR..GERENCIAL); empty string → null.
 * - `motivo` — optional free-text; max 240 chars (cap6 req7).
 */
const nivelValues = [
  "JUNIOR",
  "SEMI_SENIOR",
  "SENIOR",
  "LEAD",
  "GERENCIAL",
] as const;

export const positionHistorySchema = z.object({
  fechaEfectiva: z
    .string()
    .trim()
    .min(1, "La fecha efectiva es requerida")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), {
      message: "Fecha efectiva inválida",
    }),
  cargo: z
    .string()
    .trim()
    .min(1, "El cargo es requerido")
    .max(120, "El cargo no puede exceder 120 caracteres"),
  departamento: z
    .string()
    .trim()
    .max(120, "El departamento no puede exceder 120 caracteres")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" || val === undefined ? null : val)),
  nivel: z
    .enum(nivelValues, { message: "Nivel inválido" })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" || val === undefined ? null : val)),
  motivo: z
    .string()
    .trim()
    .max(240, "El motivo no puede exceder 240 caracteres")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" || val === undefined ? null : val)),
});

export type PositionHistorySchema = z.infer<typeof positionHistorySchema>;