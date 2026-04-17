import { z } from "zod";

export const createClienteJuridicoSchemaUI = z.object({
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

export type CreateClienteJuridicoFormValues = z.infer<
  typeof createClienteJuridicoSchemaUI
>;
