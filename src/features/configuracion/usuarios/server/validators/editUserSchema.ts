import { z } from "zod";

export const editUserSchema = z.object({
  id: z.string().min(1, "El ID del usuario es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("El correo electrónico no es válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional(),
  roles: z.array(z.string()).min(1, "Debe seleccionar al menos un rol"),
  isActive: z.boolean(),
});
