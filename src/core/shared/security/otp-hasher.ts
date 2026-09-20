import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { env } from "@/core/shared/config/env.config";

/** Fixed length of the numeric OTP code (zero-padded). */
export const OTP_CODE_LENGTH = 6;

/** OTP lifetime in minutes, shared by hashing, expiry and the email copy. */
export const OTP_TTL_MINUTES = 10;

/** SHA-256 output length in bytes; every stored hash must match it. */
const HMAC_SHA256_BYTES = 32;

/**
 * Generates a cryptographically random, zero-padded numeric OTP code.
 *
 * Uses `crypto.randomInt`, which is CSPRNG-backed with rejection sampling so
 * every value in `[0, 10^OTP_CODE_LENGTH)` is uniform — no modulo bias.
 */
export function generateOtpCode(): string {
  const upperBound = 10 ** OTP_CODE_LENGTH;
  return randomInt(0, upperBound).toString().padStart(OTP_CODE_LENGTH, "0");
}

/**
 * Hashes an OTP code with HMAC-SHA256 keyed by `OTP_HASH_SECRET` and bound to
 * the challenge id (`salt`), so a leaked hash is not portable to another
 * challenge and the same code never yields the same digest twice.
 *
 * The plaintext code is never persisted.
 */
export function hashOtpCode(params: { code: string; salt: string }): string {
  return createHmac("sha256", env.OTP_HASH_SECRET)
    .update(`${params.salt}:${params.code}`)
    .digest("hex");
}

/**
 * Constant-time comparison of a candidate code against a stored hash.
 * Returns `false` for malformed digests instead of throwing.
 */
export function verifyOtpCode(params: {
  code: string;
  salt: string;
  hash: string;
}): boolean {
  const expected = Buffer.from(params.hash, "hex");

  // Guard against malformed or truncated digests before the constant-time
  // compare, which requires both buffers to be the same length.
  if (expected.length !== HMAC_SHA256_BYTES) {
    return false;
  }

  const actual = Buffer.from(
    hashOtpCode({ code: params.code, salt: params.salt }),
    "hex",
  );

  return timingSafeEqual(actual, expected);
}
