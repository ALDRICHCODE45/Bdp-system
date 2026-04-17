import { z } from "zod";

export const createEquipoJuridicoSchemaUI = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional().nullable(),
});

export type CreateEquipoJuridicoFormValues = z.infer<
  typeof createEquipoJuridicoSchemaUI
>;
