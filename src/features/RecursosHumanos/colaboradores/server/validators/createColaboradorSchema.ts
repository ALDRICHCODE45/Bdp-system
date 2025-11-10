import { z } from "zod";
import { ColaboradorEstado } from "@prisma/client";

export const createColaboradorSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  correo: z.string().email("Email inválido"),
  puesto: z.string().min(1, "El puesto es requerido"),
  status: z.nativeEnum(ColaboradorEstado),
  imss: z.boolean(),
  socioId: z.string().optional().nullable(),
  banco: z.string().min(1, "El banco es requerido"),
  clabe: z.string().min(18, "La CLABE debe tener 18 dígitos").max(18),
  sueldo: z.number().positive("El sueldo debe ser mayor a 0"),
  activos: z.array(z.string()),
});

export type CreateColaboradorSchema = z.infer<typeof createColaboradorSchema>;

