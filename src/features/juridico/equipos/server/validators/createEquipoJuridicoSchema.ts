import { z } from "zod";

export const createEquipoJuridicoSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional().nullable(),
});

export type CreateEquipoJuridicoSchema = z.infer<
  typeof createEquipoJuridicoSchema
>;
