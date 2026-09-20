import type { OtpChallenge } from "../types/OtpChallenge.type";

export type CreateOtpChallengeArgs = {
  id: string;
  userId: string;
  codeHash: string;
  maxAttempts: number;
  expiresAt: Date;
};

/**
 * The active-challenge slot is the single source of truth for "which challenge
 * can be verified". A row is active only while it holds `activeUserId = userId`
 * (enforced by a unique index); every active/find/attempt/consume/revoke
 * predicate below therefore requires that slot, so a row that lost the slot can
 * never be read, attempted or consumed even if it was left unconsumed.
 */
export interface OtpChallengeRepository {
  /**
   * Atomically supersedes the current active-slot holder (revoking it and
   * releasing the slot in one conditional update) and inserts the new
   * challenge as the only active slot holder. Because at most one row can hold
   * the slot, a concurrent winner is never un-slotted without also being
   * revoked. Concurrent insertions of the slot are serialized by the unique
   * index and the serializable transaction, retrying so the newest issuance
   * stays active.
   */
  createReplacingActive(params: {
    data: CreateOtpChallengeArgs;
    reason: string;
    now: Date;
  }): Promise<OtpChallenge>;

  /**
   * The user's active challenge: the slot holder only, and only while it is
   * unconsumed, unrevoked and unexpired.
   */
  findActiveByUserId(params: {
    userId: string;
    now: Date;
  }): Promise<OtpChallenge | null>;

  /**
   * Atomically records one verification attempt while the challenge still holds
   * the user's active slot and is below `maxAttempts`. Returns the updated
   * challenge, or `null` when it is no longer eligible (superseded, revoked,
   * consumed, expired or capped).
   */
  registerAttempt(params: {
    userId: string;
    challengeId: string;
    maxAttempts: number;
    now: Date;
  }): Promise<OtpChallenge | null>;

  /**
   * Marks the active-slot challenge as consumed (single use) and releases the
   * slot. `true` only when this call performed the transition.
   */
  consume(params: {
    userId: string;
    challengeId: string;
    now: Date;
  }): Promise<boolean>;

  /**
   * Revokes the active-slot challenge with an audit reason and releases the
   * slot. `true` only when this call performed the transition; a superseded row
   * no longer holds the slot and is left untouched.
   */
  revoke(params: {
    userId: string;
    challengeId: string;
    reason: string;
    now: Date;
  }): Promise<boolean>;
}
