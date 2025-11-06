import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().trim().min(1, "El nombre del rol es requerido").max(50, "El nombre del rol no puede exceder 50 caracteres"),
});

