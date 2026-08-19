import { z } from "zod";

export const createAsuntoJuridicoSchemaUI = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional().nullable(),
  clienteProveedorId: z.string().uuid("Selecciona un cliente/proveedor válido"),
  socioId: z.string().uuid("Selecciona un socio válido"),
});

export type CreateAsuntoJuridicoFormValues = z.infer<
  typeof createAsuntoJuridicoSchemaUI
>;
