import { z } from "zod";

export const updateAsuntoJuridicoSchemaUI = z.object({
  id: z.string().uuid("ID de asunto jurídico inválido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional().nullable(),
  clienteJuridicoId: z.string().uuid("Selecciona un cliente jurídico válido"),
  socioId: z.string().uuid("Selecciona un socio válido"),
  estado: z.enum(["ACTIVO", "INACTIVO", "CERRADO"], {
    message: "Estado inválido",
  }),
});

export type UpdateAsuntoJuridicoFormValues = z.infer<
  typeof updateAsuntoJuridicoSchemaUI
>;
