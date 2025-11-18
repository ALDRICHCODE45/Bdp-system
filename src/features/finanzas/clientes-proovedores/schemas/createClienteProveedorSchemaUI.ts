import { z } from "zod";

export const createClienteProveedorSchemaUI = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  rfc: z
    .string()
    .min(12, "RFC inválido")
    .max(13, "RFC inválido")
    .regex(/^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/, "Formato de RFC inválido"),
  tipo: z.enum(["cliente", "proveedor"], {
    message: "El tipo debe ser cliente o proveedor",
  }),
  direccion: z.string().min(1, "La dirección es requerida"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  email: z.string().email("Email inválido"),
  contacto: z.string().min(1, "El contacto es requerido"),
  numeroCuenta: z.string().optional(),
  clabe: z
    .string()
    .refine(
      (val) => !val || (val.length === 18 && /^\d{18}$/.test(val)),
      "La CLABE debe tener exactamente 18 dígitos"
    )
    .optional(),
  banco: z.string().optional(),
  activo: z.boolean(),
  fechaRegistro: z.string().min(1, "La fecha de registro es requerida"),
  notas: z.string().optional(),
  socioId: z
    .string()
    .refine(
      (val) => !val || val === "none" || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
      "ID de socio inválido"
    )
    .optional(),
});

export type CreateClienteProveedorFormValues = z.infer<
  typeof createClienteProveedorSchemaUI
>;
