import { z } from "zod";

/**
 * Schema para crear una nueva tarifa abogado-asunto.
 *
 * - `usuarioId`, `asuntoJuridicoId`: UUIDs requeridos.
 * - `tarifaHora`: número estrictamente mayor a 0 (la spec rechaza <= 0
 *   con `Err(ValidationError("La tarifa por hora debe ser mayor a 0"))`).
 * - `motivo`: opcional.
 */
export const createTarifaSchema = z.object({
  usuarioId: z.string().uuid({ message: "ID de abogado inválido" }),
  asuntoJuridicoId: z.string().uuid({ message: "ID de asunto inválido" }),
  tarifaHora: z
    .number({ message: "La tarifa por hora debe ser un número" })
    .positive({ message: "La tarifa por hora debe ser mayor a 0" })
    .finite({ message: "La tarifa por hora debe ser un número válido" }),
  motivo: z.string().max(500).optional().nullable(),
});

export type CreateTarifaSchema = z.infer<typeof createTarifaSchema>;

/**
 * Schema para actualizar una tarifa existente. Solo cambia `tarifaHora`
 * y opcionalmente el `motivo` (que se persiste en el historial).
 */
export const updateTarifaSchema = z.object({
  id: z.string().uuid({ message: "ID de tarifa inválido" }),
  tarifaHora: z
    .number({ message: "La tarifa por hora debe ser un número" })
    .positive({ message: "La tarifa por hora debe ser mayor a 0" })
    .finite({ message: "La tarifa por hora debe ser un número válido" }),
  motivo: z.string().max(500).optional().nullable(),
});

export type UpdateTarifaSchema = z.infer<typeof updateTarifaSchema>;

export const deactivateTarifaSchema = z.object({
  id: z.string().uuid({ message: "ID de tarifa inválido" }),
});

export type DeactivateTarifaSchema = z.infer<typeof deactivateTarifaSchema>;

export const getTarifaHistorialSchema = z.object({
  id: z.string().uuid({ message: "ID de tarifa inválido" }),
});

export type GetTarifaHistorialSchema = z.infer<typeof getTarifaHistorialSchema>;
