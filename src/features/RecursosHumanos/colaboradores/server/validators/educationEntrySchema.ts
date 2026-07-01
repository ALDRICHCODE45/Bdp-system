import { z } from "zod";

/**
 * Zod validator for an EducationEntry create/update payload (cap10 req2).
 *
 * Spec cap10 req2:
 *  - `institucion` is REQUIRED.
 *  - `titulo` is REQUIRED.
 *  - `anio` is REQUIRED, integer (year, e.g. 2023).
 *  - `orden` is OPTIONAL (sensible default = 0 applied in the repo).
 *
 * The same shape is used for both create and update — only the server action
 * decides which repository method to call. `colaboradorId` and `id` are
 * validated separately at the action boundary.
 */
export const educationEntrySchema = z.object({
  institucion: z
    .string()
    .trim()
    .min(1, "La institución es requerida")
    .max(180, "La institución no puede exceder 180 caracteres"),
  titulo: z
    .string()
    .trim()
    .min(1, "El título es requerido")
    .max(180, "El título no puede exceder 180 caracteres"),
  anio: z
    .number()
    .int("El año debe ser un número entero")
    .min(1900, "El año no puede ser anterior a 1900")
    .max(2100, "El año no puede ser posterior a 2100"),
  orden: z
    .number()
    .int("El orden debe ser un número entero")
    .min(0)
    .max(1000)
    .optional(),
});

export type EducationEntrySchema = z.infer<typeof educationEntrySchema>;

/**
 * Validator for the bulk-reorder payload (cap10 req3). The client sends the
 * NEW `orden` for every id it wants repositioned; the action simply maps
 * over the array and calls the repo. We require at least 1 entry to avoid
 * empty writes.
 */
export const educationEntryReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid("ID de entrada inválido"),
        orden: z
          .number()
          .int("El orden debe ser un número entero")
          .min(0)
          .max(1000),
      })
    )
    .min(1, "Debe proporcionar al menos una entrada para reordenar"),
});

export type EducationEntryReorderSchema = z.infer<
  typeof educationEntryReorderSchema
>;