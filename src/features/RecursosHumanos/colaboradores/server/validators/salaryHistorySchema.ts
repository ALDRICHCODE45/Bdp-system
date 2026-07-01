import { z } from "zod";

/**
 * Zod validator for the salary-adjust payload (cap6 req4 + req7).
 *
 * - `fechaEfectiva` — required, must be a valid ISO date string. The server
 *   action coerces it to `Date` before the `$transaction` write.
 * - `monto` — required numeric string (Prisma Decimal). We accept a string
 *   because `<input type="number">` and copy-paste can yield values that
 *   overflow JS Number precision for 15-digit decimals. The transform to a
 *   JS number happens server-side, with bounds checks (>= 0, <= 1e12).
 * - `motivo` — optional free-text; max 240 chars (cap6 req7).
 *
 * This schema is for the SERVER action (the UI submits FormData). The action
 * layer is responsible for parsing `colaboradorId` separately.
 */
export const salaryHistorySchema = z.object({
  fechaEfectiva: z
    .string()
    .trim()
    .min(1, "La fecha efectiva es requerida")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), {
      message: "Fecha efectiva inválida",
    }),
  monto: z
    .string()
    .trim()
    .min(1, "El monto es requerido")
    .refine((v) => /^\d+(\.\d{1,3})?$/.test(v), {
      message: "El monto debe ser numérico (hasta 3 decimales)",
    })
    .refine((v) => Number(v) >= 0, {
      message: "El monto no puede ser negativo",
    })
    .refine((v) => Number(v) <= 1_000_000_000_000, {
      message: "El monto excede el límite permitido",
    }),
  motivo: z
    .string()
    .trim()
    .max(240, "El motivo no puede exceder 240 caracteres")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" || val === undefined ? null : val)),
});

export type SalaryHistorySchema = z.infer<typeof salaryHistorySchema>;