import { z } from "zod";

export const createAsuntoJuridicoSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional().nullable(),
  clienteProveedorId: z.string().uuid("ID de cliente/proveedor inválido"),
  socioId: z.string().uuid("ID de socio inválido"),
});

export type CreateAsuntoJuridicoSchema = z.infer<
  typeof createAsuntoJuridicoSchema
>;
