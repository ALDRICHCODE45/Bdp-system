import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/core/shared/config/env.config";

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}

/** SMTP transport, built once per process on first use. */
let transporter: Transporter | null = null;

/**
 * Builds (once) and returns the SMTP transport from validated env.
 *
 * Config is read from `env` instead of `process.env` so SMTP settings pass
 * through the same Zod validation as the rest of the app, and a missing host
 * fails here with an actionable message rather than letting nodemailer
 * silently default to localhost and surface an opaque transport error.
 *
 * The throwing contract is intentional: callers such as the OTP service catch
 * delivery failures and fail closed, keeping the failure inside their Result
 * boundary.
 */
function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = env;

  if (!SMTP_HOST) {
    throw new Error(
      "SMTP no configurado: falta SMTP_HOST. Define las variables SMTP_* para habilitar el envío de correos.",
    );
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT ?? 587,
    secure: SMTP_SECURE ?? false,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  return transporter;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const from = env.SMTP_FROM ?? env.SMTP_USER;

  if (!from) {
    throw new Error(
      "SMTP no configurado: falta SMTP_FROM (o SMTP_USER como remitente por defecto).",
    );
  }

  await getTransporter().sendMail({
    from,
    to: Array.isArray(params.to) ? params.to.join(", ") : params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}
