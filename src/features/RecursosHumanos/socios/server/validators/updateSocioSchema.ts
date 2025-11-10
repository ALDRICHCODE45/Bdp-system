import { z } from "zod";

export const updateSocioSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional().nullable(),
  activo: z.boolean(),
  fechaIngreso: z.date(),
  departamento: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
});

export type UpdateSocioSchema = z.infer<typeof updateSocioSchema>;
