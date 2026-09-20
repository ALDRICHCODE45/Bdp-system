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

/**
 * OTP-step form contract. The email is fixed once the code was requested, so
 * the client form only validates the code. Server actions keep validating the
 * full `verifyOtpSchema`; nothing here is trusted by the server.
 */
export const otpCodeFormSchema = z.object({
  code: otpCodeField,
});

/**
 * Display-only mirror of the server challenge TTL (`OTP_TTL_MINUTES` in
 * `@/core/shared/security/otp-hasher`). Duplicated intentionally so the client
 * login form never imports the server-only hashing module. Keep both in sync.
 */
export const OTP_CODE_TTL_MINUTES = 10;

export type RequestOtpValues = z.infer<typeof requestOtpSchema>;
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
export type OtpCodeFormValues = z.infer<typeof otpCodeFormSchema>;
