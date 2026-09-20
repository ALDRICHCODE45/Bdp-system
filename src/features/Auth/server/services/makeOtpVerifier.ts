import type { PrismaClient } from "@prisma/client";
import { PrismaOtpChallengeRepository } from "../repositories/PrismaOtpChallengeRepository.repository";
import { PrismaUserRepository } from "@/features/sistema/usuarios/server/repositories/PrismaUserRepository.repository";
import { BcryptPasswordHasher } from "@/core/shared/security/hasher";
import { OtpService } from "./OtpService.service";

/**
 * Verification-only wiring used by NextAuth's `authorize`.
 *
 * It composes the same `OtpService` as the server actions but deliberately
 * omits the SMTP delivery adapter: `authorize` only ever verifies and consumes
 * an already-emailed code, so the NextAuth (and middleware) bundle must not pull
 * the mail transport. `verifyOtp` never invokes delivery; the throwing stub
 * guarantees a mis-wired delivery path fails closed instead of silently issuing
 * a session.
 */
export const makeOtpVerifier = (deps: { prisma: PrismaClient }) =>
  new OtpService(
    new PrismaOtpChallengeRepository(deps.prisma),
    new PrismaUserRepository(deps.prisma),
    new BcryptPasswordHasher(),
    async () => {
      throw new Error(
        "OTP delivery is unavailable in the verification-only wiring.",
      );
    },
  );
