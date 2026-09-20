import { z } from "zod";

const envSchema = z
  .object({
    //Auth env validations
    AUTH_SECRET: z
      .string()
      .min(32, "AUTH_SECRET debe tener al menos 32 caracteres"),
    OTP_HASH_SECRET: z
      .string()
      .min(32, "OTP_HASH_SECRET debe tener al menos 32 caracteres"),
    NEXTAUTH_URL: z.url("NEXTAUTH_URL debe ser una URL válida"),
    AUTH_TRUST_HOST: z.coerce.boolean("AUTH_TRUST_HOST debe ser un booleano"),
    AUTH_ORIGIN: z.url("AUTH_ORIGIN debe ser una URL válida"),

    DATABASE_URL: z.string().url("DATABASE_URL debe ser una URL válida"),

    // Digital Ocean Spaces
    DO_SPACES_ENDPOINT: z
      .string()
      .url("DO_SPACES_ENDPOINT debe ser una URL válida"),
    DO_ACCESS_KEY: z.string().min(1, "DO_ACCESS_KEY es requerido"),
    DO_SECRET_KEY: z.string().min(1, "DO_SECRET_KEY es requerido"),
    DO_SPACES_BUCKET: z.string().min(1, "DO_SPACES_BUCKET es requerido"),
    DO_SPACES_REGION: z.string().min(1, "DO_SPACES_REGION es requerido"),

    // SMTP (Email). All-or-nothing: every field is optional, but if any is
    // set then all of them must be set. A half-configured transport (for
    // example a host without credentials or a sender) would otherwise fail
    // opaquely at send time instead of at startup.
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    // Strict boolean parsing: `z.coerce.boolean()` would treat the string
    // "false" as true and force TLS on a plaintext port.
    SMTP_SECURE: z
      .stringbool({ truthy: ["true", "1"], falsy: ["false", "0"] })
      .optional(),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASS: z.string().min(1).optional(),
    SMTP_FROM: z.string().min(1).optional(),

    // Inngest Cloud
    INNGEST_EVENT_KEY: z.string().optional(),
    INNGEST_SIGNING_KEY: z.string().optional(),

    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  })
  .superRefine((value, ctx) => {
    const smtpFields = [
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_SECURE",
      "SMTP_USER",
      "SMTP_PASS",
      "SMTP_FROM",
    ] as const;

    const missing = smtpFields.filter((key) => value[key] === undefined);

    // Nothing configured is valid (local/dev without email). A partial set is
    // not: report each missing field so the startup error is actionable.
    if (missing.length === smtpFields.length || missing.length === 0) {
      return;
    }

    for (const key of missing) {
      ctx.addIssue({
        code: "custom",
        path: [key],
        message:
          "La configuración SMTP es todo-o-nada: define todas las variables SMTP_* o ninguna.",
      });
    }
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const errorMsg = `❌ Error en variables de entorno:\n${parsedEnv.error.message}`;
  // Lanzar un error en vez de usar process.exit, compatible con Edge Runtime
  throw new Error(errorMsg);
}

export const env = parsedEnv.data;

export type Env = z.infer<typeof envSchema>;
