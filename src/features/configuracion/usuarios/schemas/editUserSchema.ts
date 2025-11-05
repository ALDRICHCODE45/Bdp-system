import z from "zod";

export const editUserSchemaUI = z.object({
  id: z.string().min(1, "El ID del usuario es requerido"),
  email: z.email("El correo electrónico no es válido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  password: z
    .string()
    .refine(
      (val) => val === "" || val.length >= 6,
      "La contraseña debe tener al menos 6 caracteres o estar vacía"
    ),
  roles: z.array(z.string()).min(1, "Debe seleccionar al menos un rol"),
  isActive: z.boolean(),
});
