import { z } from "zod";
import { OTP_CODE_TTL_MINUTES, otpEmailField } from "../schemas/otp.schema";

const STORAGE_KEY = "bdp-pending-otp";
const pendingOtpSchema = z.object({
  email: otpEmailField,
  expiresAt: z.number().finite(),
});

export type PendingOtp = z.infer<typeof pendingOtpSchema>;

/** Display state only. The server still validates and consumes the OTP. */
export function readPendingOtp(): PendingOtp | null {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = pendingOtpSchema.safeParse(JSON.parse(stored));
    if (parsed.success && parsed.data.expiresAt > Date.now()) return parsed.data;
  } catch {
    // Storage may be blocked or contain invalid JSON.
  }
  clearPendingOtp();
  return null;
}

export function savePendingOtp(email: string): PendingOtp {
  const pending = {
    email,
    expiresAt: Date.now() + OTP_CODE_TTL_MINUTES * 60_000,
  };
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  } catch {
    // Keep the current in-memory flow usable when storage is unavailable.
  }
  return pending;
}

export function clearPendingOtp(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Clearing display state must not interrupt successful authentication.
  }
}
