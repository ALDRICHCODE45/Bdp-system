import { z } from "zod";

const envSchema = z.object({
  //Auth env validations
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET debe tener al menos 32 caracteres"),
  NEXTAUTH_URL: z.url("NEXTAUTH_URL debe ser una URL válida"),
  AUTH_TRUST_HOST: z.coerce.boolean("AUTH_TRUST_HOST debe ser un booleano"),
  AUTH_ORIGIN: z.url("AUTH_ORIGIN debe ser una URL válida"),

  //TODO: descomentar cuando se agregue la variable de entorno
  //DATABASE_URL: z.string().url("DATABASE_URL debe ser una URL válida").optional(),

  // Digital Ocean Spaces
  DO_SPACES_ENDPOINT: z.string().url("DO_SPACES_ENDPOINT debe ser una URL válida"),
  DO_ACCESS_KEY: z.string().min(1, "DO_ACCESS_KEY es requerido"),
  DO_SECRET_KEY: z.string().min(1, "DO_SECRET_KEY es requerido"),
  DO_SPACES_BUCKET: z.string().min(1, "DO_SPACES_BUCKET es requerido"),
  DO_SPACES_REGION: z.string().min(1, "DO_SPACES_REGION es requerido"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const errorMsg = `❌ Error en variables de entorno:\n${parsedEnv.error.message}`;
  // Lanzar un error en vez de usar process.exit, compatible con Edge Runtime
  throw new Error(errorMsg);
}

export const env = parsedEnv.data;

export type Env = z.infer<typeof envSchema>;
