import { z } from "zod";

export const updateSocioSchemaUI = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string(),
  activo: z.boolean(),
  fechaIngreso: z.string().min(1, "La fecha de ingreso es requerida"),
  departamento: z.string(),
  notas: z.string(),
});

export type UpdateSocioFormValues = z.infer<typeof updateSocioSchemaUI>;

