import { z } from "zod";

export const createAsuntoJuridicoSchemaUI = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional().nullable(),
  clienteJuridicoId: z.string().uuid("Selecciona un cliente jurídico válido"),
  socioId: z.string().uuid("Selecciona un socio válido"),
});

export type CreateAsuntoJuridicoFormValues = z.infer<
  typeof createAsuntoJuridicoSchemaUI
>;
