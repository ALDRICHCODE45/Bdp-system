import z from "zod";

export const createUserSchemaUI = z.object({
  email: z.email("El correo electrónico no es válido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  roles: z.array(z.string()).min(1, "Debe seleccionar al menos un rol"),
});
