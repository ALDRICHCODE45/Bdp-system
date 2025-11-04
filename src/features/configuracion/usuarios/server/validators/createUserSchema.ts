import z from "zod";

export const createUserSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().trim().min(6),
  roles: z.array(z.string()),
});
