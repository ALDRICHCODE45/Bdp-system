import { z } from "zod";

/**
 * Zod validator for a VacationBalance manual-set payload (cap9 req1).
 *
 * Spec cap9 req1:
 *  - `diasDisponibles` is the user's remaining quota (Int).
 *  - `diasTomados` is the count of days already consumed (Int).
 *  - There is NO auto-accrual rule — both fields are set manually.
 *
 * Both fields are non-negative integers; we cap at 366 to mirror the
 * `dias` upper bound on `AbsenceRecord` (a sanity guard against typos).
 */
export const vacationBalanceSchema = z.object({
  diasDisponibles: z
    .number()
    .int("Los días disponibles deben ser un número entero")
    .min(0, "Los días disponibles no pueden ser negativos")
    .max(366, "Los días disponibles no pueden exceder 366"),
  diasTomados: z
    .number()
    .int("Los días tomados deben ser un número entero")
    .min(0, "Los días tomados no pueden ser negativos")
    .max(366, "Los días tomados no pueden exceder 366"),
});

export type VacationBalanceSchema = z.infer<typeof vacationBalanceSchema>;