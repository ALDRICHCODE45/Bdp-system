import { z } from "zod";

/**
 * Server-side Zod schema for validating ONE row from a bank-statement Excel import.
 *
 * Required fields per the Excel layout:
 * tipo (derived from Abono/Cargo), titular, estadoCuenta,
 * fechaCorte, fechaOperacion, descripcionLiteral, monto.
 *
 * Refinement: monto > 0.
 */
export const importMovimientoRowValidator = z.object({
  tipo: z.enum(["INGRESO", "EGRESO"], {
    message: "El tipo debe ser INGRESO o EGRESO (derivado de Abono/Cargo)",
  }),

  titular: z
    .string()
    .min(1, "El titular es requerido")
    .transform((val) => val.trim()),

  estadoCuenta: z
    .string()
    .min(1, "El estado de cuenta es requerido")
    .transform((val) => val.trim()),

  fechaCorte: z
    .string()
    .min(1, "La fecha de corte es requerida")
    .transform((val) => val.trim()),

  fechaOperacion: z
    .string()
    .min(1, "La fecha de operacion es requerida")
    .transform((val) => val.trim()),

  descripcionLiteral: z
    .string()
    .min(1, "La descripcion literal es requerida")
    .transform((val) => val.trim()),

  monto: z
    .number({ message: "El monto debe ser un numero valido" })
    .positive("El monto debe ser mayor a 0"),

  /** 1-based Excel row number for error reporting */
  sourceRowNumber: z.number().int().positive(),
});

export type ImportMovimientoRowInput = z.infer<
  typeof importMovimientoRowValidator
>;
