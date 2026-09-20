import { z } from "zod";

/**
 * Shared OTP wire schemas. Kept free of server-only imports so both the client
 * login form (OTP-3) and the server actions can reuse the exact same contract.
 */

/** Email is normalized once here so limiter keys and lookups agree. */
export const otpEmailField = z
  .email("El correo electrónico no es válido.")
  .transform((value) => value.trim().toLowerCase());

/** Exactly six digits: the only OTP shape the service will ever hash. */
export const otpCodeField = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "El código debe tener exactamente 6 dígitos.");

export const requestOtpSchema = z.object({
  email: otpEmailField,
  password: z.string().min(1, "La contraseña es requerida."),
});

export const verifyOtpSchema = z.object({
  email: otpEmailField,
  code: otpCodeField,
});

export type RequestOtpValues = z.infer<typeof requestOtpSchema>;
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
