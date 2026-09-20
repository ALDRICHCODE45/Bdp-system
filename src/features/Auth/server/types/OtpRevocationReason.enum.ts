/**
 * Audited reasons a challenge can be revoked. Persisted verbatim in
 * `OtpChallenge.revokedReason` so revocations stay explainable after the fact.
 */
export enum OtpRevocationReason {
  /** A newer challenge was issued for the same user, invalidating this one. */
  Superseded = "superseded",
  /** The OTP email could not be delivered; the challenge fails closed. */
  SmtpFailure = "smtp_failure",
  /** The challenge exhausted its database-backed attempt cap. */
  MaxAttempts = "max_attempts",
}
