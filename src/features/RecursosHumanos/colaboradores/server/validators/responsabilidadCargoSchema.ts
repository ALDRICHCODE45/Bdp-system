import { z } from "zod";

/**
 * Zod validator for a ResponsabilidadCargo create/update payload.
 *
 * Spec cap5 req4: descripcion is REQUIRED; orden + completada are optional
 * (sensible defaults applied in the repo: orden=0, completada=false).
 *
 * The same shape is used for both create and update — only the server action
 * decides which repository method to call.
 *
 * `colaboradorId` is a route param (only used on create) and `id` is the
 * primary key on update/toggle; both are validated at the action boundary,
 * not in the schema, so the same Zod object can serve both forms.
 */
export const responsabilidadCargoSchema = z.object({
  descripcion: z
    .string()
    .trim()
    .min(1, "La descripción es requerida")
    .max(280, "La descripción no puede exceder 280 caracteres"),
  orden: z
    .number()
    .int("El orden debe ser un número entero")
    .min(0)
    .max(1000)
    .optional(),
  completada: z.boolean().optional(),
});

export type ResponsabilidadCargoSchema = z.infer<
  typeof responsabilidadCargoSchema
>;
