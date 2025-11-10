import { z } from "zod";
import { ColaboradorEstado } from "../types/ColaboradorEstado.enum";

export const updateColaboradorSchemaUI = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido"),
  correo: z.string().email("Email inválido"),
  puesto: z.string().min(1, "El puesto es requerido"),
  status: z.nativeEnum(ColaboradorEstado),
  imss: z.boolean(),
  socioId: z.string(), // Acepta "__none__" o UUID de socio
  banco: z.string().min(1, "El banco es requerido"),
  clabe: z.string().min(1, "La CLABE es requerida"),
  sueldo: z.string().min(1, "El sueldo es requerido"),
  activos: z.array(z.string()),
});

export type UpdateColaboradorFormValues = z.infer<
  typeof updateColaboradorSchemaUI
>;
