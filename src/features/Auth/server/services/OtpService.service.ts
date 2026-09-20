import { randomUUID } from "node:crypto";
import type { OtpChallengeRepository } from "../repositories/OtpChallengeRepository.repository";
import type { UserRepository } from "@/features/sistema/usuarios/server/repositories/UserRepository.repository";
import type { PasswordHasher } from "@/core/shared/security/hasher";
import { Err, Ok, type Result } from "@/core/shared/result/result";
import { DomainError, ValidationError } from "@/core/shared/errors/domain";
import {
  generateOtpCode,
  hashOtpCode,
  verifyOtpCode,
  OTP_TTL_MINUTES,
} from "@/core/shared/security/otp-hasher";
import {
  normalizeEmail,
  otpRequestLimiter,
  otpVerifyLimiter,
} from "@/core/shared/security/rate-limit";
import { OtpRevocationReason } from "../types/OtpRevocationReason.enum";

/** Database-backed verification cap applied to every new challenge. */
const OTP_MAX_ATTEMPTS = 5;

/**
 * Single generic message for every credential failure, so the endpoint never
 * reveals whether an account exists, is inactive, or had a wrong password.
 */
const GENERIC_CREDENTIALS_ERROR = "Credenciales inválidas.";

/** Single generic message for every OTP failure: invalid, expired or consumed. */
const GENERIC_OTP_ERROR = "El código es inválido o expiró.";

const THROTTLE_ERROR = "Demasiados intentos. Intenta de nuevo más tarde.";
const DELIVERY_ERROR =
  "No se pudo enviar el código de verificación. Intenta de nuevo más tarde.";

/**
 * Generic failure for infrastructure errors (database, hasher). Kept opaque so
 * an unexpected backend failure is never an account/OTP enumeration oracle.
 */
const INTERNAL_ERROR =
  "No se pudo procesar la solicitud. Intenta de nuevo más tarde.";

/** Delivers the OTP out-of-band. Injected so the service stays storage-agnostic. */
export type OtpDelivery = (params: {
  to: string;
  name: string;
  code: string;
  expiresInMinutes: number;
}) => Promise<void>;

export type RequestOtpInput = {
  email: string;
  password: string;
  /** Caller identifier (e.g. client IP) used to scope rate-limit buckets. */
  clientKey?: string;
};

export type VerifyOtpInput = {
  email: string;
  code: string;
  clientKey?: string;
};

export type VerifiedOtp = { userId: string; email: string };

export class OtpService {
  constructor(
    private readonly otpRepository: OtpChallengeRepository,
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly deliverOtp: OtpDelivery,
    private readonly now: () => Date = () => new Date(),
  ) {}

  /**
   * Verifies the submitted password, then issues a fresh single-use OTP.
   * Any previously active challenge is superseded first, and the new challenge
   * is revoked if delivery fails (fail closed).
   */
  async requestOtp(input: RequestOtpInput): Promise<Result<void, Error>> {
    const email = normalizeEmail(input.email);
    const limiterKey = this.limiterKey("request", input.clientKey, email);

    // Throttle before hashing: a blocked caller never reaches bcrypt.
    if (!otpRequestLimiter.check(limiterKey)) {
      return Err(new ValidationError("OTP_THROTTLED", THROTTLE_ERROR));
    }

    const userResult = await this.guard(() =>
      this.userRepository.findByEmailWithPassword({ email }),
    );

    if (!userResult.ok) {
      return Err(userResult.error);
    }

    const user = userResult.value;

    if (!user || !user.isActive) {
      return Err(
        new ValidationError("INVALID_CREDENTIALS", GENERIC_CREDENTIALS_ERROR),
      );
    }

    const passwordResult = await this.guard(() =>
      this.passwordHasher.verify(input.password, user.password),
    );

    if (!passwordResult.ok) {
      return Err(passwordResult.error);
    }

    if (!passwordResult.value) {
      return Err(
        new ValidationError("INVALID_CREDENTIALS", GENERIC_CREDENTIALS_ERROR),
      );
    }

    // Code generation and hashing are wrapped too: hashing reads the OTP
    // secret, so a missing/invalid secret must stay inside the Result contract.
    const issuedResult = await this.guard(() => {
      // The challenge id doubles as the HMAC salt, binding the hash to this row.
      const challengeId = randomUUID();
      const code = generateOtpCode();

      return {
        challengeId,
        code,
        codeHash: hashOtpCode({ code, salt: challengeId }),
      };
    });

    if (!issuedResult.ok) {
      return Err(issuedResult.error);
    }

    const { challengeId, code, codeHash } = issuedResult.value;

    // The clock read stays inside the Result boundary: a throwing clock must
    // degrade to an opaque Err instead of escaping the service contract.
    const nowResult = await this.guard(() => this.now());

    if (!nowResult.ok) {
      return Err(nowResult.error);
    }

    const now = nowResult.value;

    const createResult = await this.guard(() =>
      this.otpRepository.createReplacingActive({
        data: {
          id: challengeId,
          userId: user.id,
          codeHash,
          maxAttempts: OTP_MAX_ATTEMPTS,
          expiresAt: new Date(now.getTime() + OTP_TTL_MINUTES * 60_000),
        },
        reason: OtpRevocationReason.Superseded,
        now,
      }),
    );

    if (!createResult.ok) {
      return Err(createResult.error);
    }

    try {
      await this.deliverOtp({
        to: user.email,
        name: user.name,
        code,
        expiresInMinutes: OTP_TTL_MINUTES,
      });
    } catch {
      // Fail closed: the user never received a code, so revoke the unusable
      // challenge and keep an auditable reason for the failure. The revocation
      // is best-effort and goes through the same Result boundary, so a DB error
      // here can never escape as a thrown exception.
      await this.guard(() =>
        this.otpRepository.revoke({
          userId: user.id,
          challengeId,
          reason: OtpRevocationReason.SmtpFailure,
          now: this.now(),
        }),
      );

      return Err(new ValidationError("OTP_DELIVERY_FAILED", DELIVERY_ERROR));
    }

    return Ok(undefined);
  }

  /**
   * Verifies a submitted OTP against the user's active challenge. Attempts are
   * counted in the database and the challenge is consumed on success, so a code
   * can never be replayed.
   */
  async verifyOtp(input: VerifyOtpInput): Promise<Result<VerifiedOtp, Error>> {
    const email = normalizeEmail(input.email);
    const limiterKey = this.limiterKey("verify", input.clientKey, email);

    if (!otpVerifyLimiter.check(limiterKey)) {
      return Err(new ValidationError("OTP_THROTTLED", THROTTLE_ERROR));
    }

    const userResult = await this.guard(() =>
      this.userRepository.findByEmailWithPassword({ email }),
    );

    if (!userResult.ok) {
      return Err(userResult.error);
    }

    const user = userResult.value;

    if (!user || !user.isActive) {
      return Err(new ValidationError("INVALID_OTP", GENERIC_OTP_ERROR));
    }

    // Same Result boundary as the queries below: a clock failure returns Err
    // instead of throwing out of verifyOtp.
    const nowResult = await this.guard(() => this.now());

    if (!nowResult.ok) {
      return Err(nowResult.error);
    }

    const now = nowResult.value;
    const challengeResult = await this.guard(() =>
      this.otpRepository.findActiveByUserId({ userId: user.id, now }),
    );

    if (!challengeResult.ok) {
      return Err(challengeResult.error);
    }

    const challenge = challengeResult.value;

    if (!challenge) {
      return Err(new ValidationError("INVALID_OTP", GENERIC_OTP_ERROR));
    }

    // Claim an attempt atomically before comparing, so parallel guesses cannot
    // exceed the cap.
    const attemptResult = await this.guard(() =>
      this.otpRepository.registerAttempt({
        userId: user.id,
        challengeId: challenge.id,
        maxAttempts: challenge.maxAttempts,
        now,
      }),
    );

    if (!attemptResult.ok) {
      return Err(attemptResult.error);
    }

    const attempted = attemptResult.value;

    if (!attempted) {
      await this.guard(() =>
        this.otpRepository.revoke({
          userId: user.id,
          challengeId: challenge.id,
          reason: OtpRevocationReason.MaxAttempts,
          now,
        }),
      );

      return Err(new ValidationError("INVALID_OTP", GENERIC_OTP_ERROR));
    }

    const codeResult = await this.guard(() =>
      verifyOtpCode({
        code: input.code,
        salt: challenge.id,
        hash: challenge.codeHash,
      }),
    );

    if (!codeResult.ok) {
      return Err(codeResult.error);
    }

    if (!codeResult.value) {
      if (attempted.attempts >= attempted.maxAttempts) {
        await this.guard(() =>
          this.otpRepository.revoke({
            userId: user.id,
            challengeId: challenge.id,
            reason: OtpRevocationReason.MaxAttempts,
            now,
          }),
        );
      }

      return Err(new ValidationError("INVALID_OTP", GENERIC_OTP_ERROR));
    }

    const consumeResult = await this.guard(() =>
      this.otpRepository.consume({
        userId: user.id,
        challengeId: challenge.id,
        now: this.now(),
      }),
    );

    if (!consumeResult.ok) {
      return Err(consumeResult.error);
    }

    if (!consumeResult.value) {
      return Err(new ValidationError("INVALID_OTP", GENERIC_OTP_ERROR));
    }

    return Ok({ userId: user.id, email: user.email });
  }

  /**
   * Converts any thrown infrastructure error into an `Err`, so repository,
   * hasher and code-issuance failures can never escape the service's Result
   * contract into the server actions. The thrown value is deliberately not
   * exposed to callers: it may contain backend details, so a single opaque
   * internal error is returned instead.
   */
  private async guard<T>(
    operation: () => T | Promise<T>,
  ): Promise<Result<T, Error>> {
    try {
      return Ok(await operation());
    } catch (error) {
      console.error(
        "[OtpService] Fallo de infraestructura en el flujo OTP",
        error,
      );

      return Err(new DomainError("OTP_INTERNAL_ERROR", INTERNAL_ERROR));
    }
  }

  /**
   * Buckets are scoped by flow as well as by (client, email). Every limiter
   * shares one process-wide map, so the flow segment guarantees OTP issuance,
   * OTP verification and the login flow can never consume each other's
   * counters (or be reset by one another).
   */
  private limiterKey(
    flow: "request" | "verify",
    clientKey: string | undefined,
    email: string,
  ): string {
    return `${flow}|${clientKey ?? "unknown"}|${email}`;
  }
}
