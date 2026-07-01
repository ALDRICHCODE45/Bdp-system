import { z } from "zod";

/**
 * Zod validator for an EmergencyContact create/update payload.
 *
 * Spec cap4 req4: nombre + parentesco + telefono are REQUIRED (any of them
 * missing on submit must block the save with a validation error). email and
 * notas are optional; email must look like an email when present, notas is
 * free text.
 *
 * The shape stays identical for create and update — both ops accept the same
 * input fields. `colaboradorId` and `id` are validated separately in the
 * server action (route-bound params, not part of the form payload).
 */
export const emergencyContactSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es requerido")
    .max(120, "El nombre no puede exceder 120 caracteres"),
  parentesco: z
    .string()
    .trim()
    .min(1, "El parentesco es requerido")
    .max(60, "El parentesco no puede exceder 60 caracteres"),
  telefono: z
    .string()
    .trim()
    .min(1, "El teléfono es requerido")
    .max(40, "El teléfono no puede exceder 40 caracteres"),
  email: z
    .string()
    .trim()
    .email("Email inválido")
    .max(120, "El email no puede exceder 120 caracteres")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" || val === undefined ? null : val)),
  notas: z
    .string()
    .trim()
    .max(500, "Las notas no pueden exceder 500 caracteres")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" || val === undefined ? null : val)),
});

export type EmergencyContactSchema = z.infer<typeof emergencyContactSchema>;
