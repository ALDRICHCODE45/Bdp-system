import { z } from "zod";

export const updateEquipoJuridicoSchemaUI = z.object({
  id: z.string().uuid("ID de equipo jurídico inválido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional().nullable(),
});

export type UpdateEquipoJuridicoFormValues = z.infer<
  typeof updateEquipoJuridicoSchemaUI
>;
