-- Enforces at most one active OTP challenge per user at the database level.
-- "Active" rows mirror userId in activeUserId; consumed/revoked rows set it to
-- NULL. Postgres treats NULLs as distinct, so inactive rows never collide.
-- This is the backstop for the revoke+create issuance path: only the newest
-- issued challenge can hold the slot and therefore only it can verify.

-- AlterTable
ALTER TABLE "OtpChallenge" ADD COLUMN "activeUserId" TEXT;

-- Backfill: the most recent eligible challenge per user becomes the active one.
-- Use DISTINCT ON so each user contributes exactly one row, matching the new
-- unique index.
UPDATE "OtpChallenge" AS c
SET "activeUserId" = c."userId"
FROM (
    SELECT DISTINCT ON ("userId") "id"
    FROM "OtpChallenge"
    WHERE "consumedAt" IS NULL
      AND "revokedAt" IS NULL
      AND "expiresAt" > NOW()
    ORDER BY "userId", "createdAt" DESC
) AS active
WHERE c."id" = active."id";

-- CreateIndex
CREATE UNIQUE INDEX "OtpChallenge_activeUserId_key" ON "OtpChallenge"("activeUserId");
