import { z } from "zod";

export const updateAsuntoJuridicoSchema = z.object({
  id: z.string().uuid("ID de asunto jurídico inválido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional().nullable(),
  clienteProveedorId: z.string().uuid("ID de cliente/proveedor inválido"),
  socioId: z.string().uuid("ID de socio inválido"),
  estado: z.enum(["ACTIVO", "INACTIVO", "CERRADO"], {
    message: "Estado inválido",
  }),
});

export type UpdateAsuntoJuridicoSchema = z.infer<
  typeof updateAsuntoJuridicoSchema
>;
