/**
 * Domain shape of an OTP challenge as the Auth feature consumes it.
 * Deliberately excludes the plaintext code: only `codeHash` ever exists.
 */
export type OtpChallenge = {
  id: string;
  userId: string;
  codeHash: string;
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  consumedAt: Date | null;
  revokedAt: Date | null;
  revokedReason: string | null;
  createdAt: Date;
};
