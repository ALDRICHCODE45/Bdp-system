import { z } from "zod";

export const createClienteProveedorSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  rfc: z
    .string()
    .min(12, "RFC inválido")
    .max(13, "RFC inválido")
    .regex(/^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/, "Formato de RFC inválido"),
  tipo: z.enum(["CLIENTE", "PROVEEDOR"], {
    message: "El tipo debe ser CLIENTE o PROVEEDOR",
  }),
  direccion: z.string().min(1, "La dirección es requerida"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  email: z.string().email("Email inválido"),
  contacto: z.string().min(1, "El contacto es requerido"),
  numeroCuenta: z.string().optional().nullable(),
  clabe: z
    .string()
    .length(18, "La CLABE debe tener exactamente 18 dígitos")
    .regex(/^\d{18}$/, "La CLABE debe contener solo números")
    .optional()
    .nullable(),
  banco: z.string().optional().nullable(),
  activo: z.boolean(),
  fechaRegistro: z.date(),
  notas: z.string().optional().nullable(),
  socioId: z.string().uuid("ID de socio inválido").optional().nullable(),
});

export type CreateClienteProveedorSchema = z.infer<
  typeof createClienteProveedorSchema
>;
