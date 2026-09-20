import type { OtpChallenge as PrismaOtpChallenge } from "@prisma/client";
import type { OtpChallenge } from "../types/OtpChallenge.type";

/** Strips Prisma-only fields (`updatedAt`) before crossing the service boundary. */
export function toOtpChallenge(challenge: PrismaOtpChallenge): OtpChallenge {
  return {
    id: challenge.id,
    userId: challenge.userId,
    codeHash: challenge.codeHash,
    attempts: challenge.attempts,
    maxAttempts: challenge.maxAttempts,
    expiresAt: challenge.expiresAt,
    consumedAt: challenge.consumedAt,
    revokedAt: challenge.revokedAt,
    revokedReason: challenge.revokedReason,
    createdAt: challenge.createdAt,
  };
}
