import { Prisma, type PrismaClient } from "@prisma/client";
import type {
  CreateOtpChallengeArgs,
  OtpChallengeRepository,
} from "./OtpChallengeRepository.repository";
import type { OtpChallenge } from "../types/OtpChallenge.type";
import { toOtpChallenge } from "../mappers/otpChallengeMapper";

/**
 * Bounded retry budget for the "one active challenge per user" slot. A retry is
 * needed when a concurrent issuance wins the unique-slot race (P2002) or when
 * PostgreSQL's serializable isolation aborts one of two overlapping writers
 * (P2034). The loser re-runs and supersedes the winner, so the newest request
 * stays active.
 */
const MAX_ISSUE_RETRIES = 3;

/**
 * Errors that mean "another issuer won this round": retry the whole
 * transaction so this issuance supersedes it instead of failing. P2002 is the
 * unique activeUserId slot; P2034 is a serializable write conflict/deadlock.
 */
function isRetryableIssueError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2002" || error.code === "P2034")
  );
}

export class PrismaOtpChallengeRepository implements OtpChallengeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createReplacingActive(params: {
    data: CreateOtpChallengeArgs;
    reason: string;
    now: Date;
  }): Promise<OtpChallenge> {
    const { data, reason, now } = params;

    for (let attempt = 0; ; attempt++) {
      try {
        const challenge = await this.prisma.$transaction(
          async (tx) => {
            // Supersede whoever currently holds the active slot. The unique
            // activeUserId index guarantees at most one such row, and this
            // single conditional update both revokes it and releases the slot,
            // so a concurrent winner can never be left un-slotted without also
            // being revoked. Requiring the slot means a stale, non-slot row is
            // never touched.
            await tx.otpChallenge.updateMany({
              where: { userId: data.userId, activeUserId: data.userId },
              data: {
                revokedAt: now,
                revokedReason: reason,
                activeUserId: null,
              },
            });

            return tx.otpChallenge.create({
              data: {
                id: data.id,
                userId: data.userId,
                codeHash: data.codeHash,
                maxAttempts: data.maxAttempts,
                expiresAt: data.expiresAt,
                activeUserId: data.userId,
              },
            });
          },
          // Serializable closes the revoke/re-claim window: if two issuances
          // interleave, one is aborted (P2034) and retried instead of both
          // believing they cleared the other's slot.
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );

        return toOtpChallenge(challenge);
      } catch (error) {
        // The partial-free unique slot is the DB-level backstop: even if two
        // issuances interleave, at most one challenge can hold it. The loser
        // retries and supersedes the winner, preserving "newest wins".
        if (isRetryableIssueError(error) && attempt < MAX_ISSUE_RETRIES) {
          continue;
        }

        throw error;
      }
    }
  }

  async findActiveByUserId(params: {
    userId: string;
    now: Date;
  }): Promise<OtpChallenge | null> {
    const challenge = await this.prisma.otpChallenge.findFirst({
      where: {
        // The slot holder is authoritative: a row that lost the slot is never
        // returned, even if it is still unconsumed/unrevoked.
        userId: params.userId,
        activeUserId: params.userId,
        consumedAt: null,
        revokedAt: null,
        expiresAt: { gt: params.now },
      },
      orderBy: { createdAt: "desc" },
    });

    return challenge ? toOtpChallenge(challenge) : null;
  }

  async registerAttempt(params: {
    userId: string;
    challengeId: string;
    maxAttempts: number;
    now: Date;
  }): Promise<OtpChallenge | null> {
    // Conditional update = atomic claim: concurrent verifications cannot push
    // the counter past the cap, because only the first `maxAttempts` updates
    // match the `attempts < maxAttempts` predicate. Requiring the active slot
    // also invalidates the request when the challenge was superseded mid-flight.
    const result = await this.prisma.otpChallenge.updateMany({
      where: {
        id: params.challengeId,
        userId: params.userId,
        activeUserId: params.userId,
        consumedAt: null,
        revokedAt: null,
        expiresAt: { gt: params.now },
        attempts: { lt: params.maxAttempts },
      },
      data: { attempts: { increment: 1 } },
    });

    if (result.count === 0) {
      return null;
    }

    const challenge = await this.prisma.otpChallenge.findUnique({
      where: { id: params.challengeId },
    });

    return challenge ? toOtpChallenge(challenge) : null;
  }

  async consume(params: {
    userId: string;
    challengeId: string;
    now: Date;
  }): Promise<boolean> {
    const result = await this.prisma.otpChallenge.updateMany({
      where: {
        id: params.challengeId,
        userId: params.userId,
        // Only the slot holder can be consumed, so a superseded challenge can
        // never be replayed after a newer one took the slot.
        activeUserId: params.userId,
        consumedAt: null,
        revokedAt: null,
        expiresAt: { gt: params.now },
      },
      // Release the active slot so a later issuance is never blocked by a
      // consumed challenge.
      data: { consumedAt: params.now, activeUserId: null },
    });

    return result.count === 1;
  }

  async revoke(params: {
    userId: string;
    challengeId: string;
    reason: string;
    now: Date;
  }): Promise<boolean> {
    const result = await this.prisma.otpChallenge.updateMany({
      where: {
        id: params.challengeId,
        userId: params.userId,
        // Slot-scoped: a challenge that a newer issuance already superseded no
        // longer holds the slot, so this can never clear the current winner.
        activeUserId: params.userId,
        consumedAt: null,
        revokedAt: null,
      },
      data: {
        revokedAt: params.now,
        revokedReason: params.reason,
        activeUserId: null,
      },
    });

    return result.count === 1;
  }
}
