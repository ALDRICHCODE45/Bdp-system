import z from "zod";

export const userLoginSchema = z.object({
  email: z
    .string()
    .min(5, "El correo debe tener al menos 5 caracteres.")
    .max(32, "El correo debe tener como máximo 32 caracteres."),
  password: z
    .string()
    .min(5, "La contraseña debe tener al menos 20 caracteres.")
    .max(100, "La contraseña debe tener como máximo 100 caracteres."),
});
