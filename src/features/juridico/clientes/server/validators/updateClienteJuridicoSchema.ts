import { z } from "zod";

export const updateClienteJuridicoSchema = z.object({
  id: z.string().uuid("ID de cliente jurídico inválido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  rfc: z.string().optional().nullable(),
  contacto: z.string().optional().nullable(),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  telefono: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
});

export type UpdateClienteJuridicoSchema = z.infer<
  typeof updateClienteJuridicoSchema
>;
