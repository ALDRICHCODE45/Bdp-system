import { z } from "zod";

export const createSocioSchemaUI = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string(),
  activo: z.boolean(),
  fechaIngreso: z.string().min(1, "La fecha de ingreso es requerida"),
  departamento: z.string(),
  notas: z.string(),
});

export type CreateSocioFormValues = z.infer<typeof createSocioSchemaUI>;

