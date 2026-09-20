/**
 * In-memory fixed-window rate limiter factory.
 *
 * - Singleton `Map<string, Bucket>` is pinned to `globalThis` so it survives
 *   Next.js dev-mode HMR (which re-evaluates modules and would otherwise
 *   discard a module-local Map) and is shared across every Server Action /
 *   `authorize()` invocation in the single production process.
 * - `check()` is synchronous and atomic from Node's perspective: it does
 *   read-modify-write without `await`, so two concurrent checks cannot
 *   interleave their bucket updates.
 * - Memory is bounded by a hard cap (`MAX_BUCKETS`); on overflow, expired
 *   buckets are dropped first, and one oldest entry is evicted as a last
 *   resort so the limiter can never grow without bound under churn.
 * - A self-scheduling, unref'd `setInterval` opportunistically sweeps
 *   expired buckets between checks.
 *
 * Deployment dependency (not solved here): the bucket map is process-local, so
 * throttling is only exact for a single running instance. Behind multiple
 * replicas or a load balancer each process keeps its own counters, multiplying
 * the effective limit; a shared store (Redis) or sticky routing is required to
 * enforce a global limit. Per-client keys likewise assume the edge proxy is the
 * sole ingress and forwards an untrusted-safe `x-forwarded-for`.
 */

type Bucket = { count: number; resetAt: number };

export type Limiter = {
  /**
   * Record an attempt for `key`. Returns `true` when the attempt is
   * allowed (count incremented, or fresh bucket created) and `false`
   * when the bucket is at or above `maxAttempts`.
   */
  check(key: string): boolean;
  /** Clear the bucket for `key` (e.g. after a successful login). */
  reset(key: string): void;
};

const MAX_BUCKETS = 10_000;
const SWEEP_FRACTION = 2; // sweep every windowMs / SWEEP_FRACTION

declare const globalThis: {
  __bdpRateLimiters?: Map<string, Bucket>;
} & typeof global;

const buckets: Map<string, Bucket> =
  globalThis.__bdpRateLimiters ?? new Map<string, Bucket>();

if (!globalThis.__bdpRateLimiters) {
  globalThis.__bdpRateLimiters = buckets;
}

export function createFixedWindowLimiter(params: {
  /**
   * Flow-unique name. Every limiter shares the single process-wide `buckets`
   * map, so the name is prefixed onto every key. Without it, structurally
   * identical keys from different flows (login, OTP request and OTP
   * verification all key on `${client}|${email}`) collide in one bucket: OTP
   * attempts would count against login, and `loginLimiter.reset()` on a
   * successful sign-in would silently clear an unrelated flow.
   */
  name: string;
  maxAttempts: number;
  windowMs: number;
}): Limiter {
  const { name, maxAttempts, windowMs } = params;

  // Flow namespace: isolates this limiter's buckets from every other limiter
  // sharing the global map, so flows cannot interfere with each other.
  const scoped = (key: string) => `${name}|${key}`;

  const sweep = () => {
    const now = Date.now();
    for (const [k, v] of buckets) {
      if (now >= v.resetAt) buckets.delete(k);
    }
  };

  const intervalMs = Math.max(1, Math.floor(windowMs / SWEEP_FRACTION));
  const handle = setInterval(sweep, intervalMs);
  // Don't keep the Node process alive just for periodic GC.
  handle.unref?.();

  return {
    check(key) {
      const now = Date.now();
      const bucketKey = scoped(key);
      const existing = buckets.get(bucketKey);

      // Expired or absent → start a fresh bucket and allow the attempt.
      if (!existing || now >= existing.resetAt) {
        // Bounded growth: drop expired entries first; if still at the cap,
        // evict one oldest entry so the limiter cannot grow without bound.
        if (buckets.size >= MAX_BUCKETS) {
          for (const [k, v] of buckets) {
            if (now >= v.resetAt) buckets.delete(k);
          }
          if (buckets.size >= MAX_BUCKETS) {
            const oldest = buckets.keys().next().value;
            if (oldest !== undefined) buckets.delete(oldest);
          }
        }
        buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
        return true;
      }

      if (existing.count < maxAttempts) {
        existing.count++;
        return true;
      }

      // Bucket is full → deny without incrementing.
      return false;
    },

    reset(key) {
      buckets.delete(scoped(key));
    },
  };
}

/** Trim whitespace and lowercase for use in limiter keys. */
export function normalizeEmail(s: string): string {
  return s.trim().toLowerCase();
}

/** Credentials login: 5 attempts per 10 minutes per (ip, email). */
export const loginLimiter: Limiter = createFixedWindowLimiter({
  name: "auth:login",
  maxAttempts: 5,
  windowMs: 600_000,
});

/** Public QR attendance action: 2 attempts per minute per correo. */
export const asistenciaPublicThrottle: Limiter = createFixedWindowLimiter({
  name: "asistencia:public",
  maxAttempts: 2,
  windowMs: 60_000,
});

/**
 * OTP issuance: 3 requests per 15 minutes per (client, email). Keeps the
 * password→OTP step from being used for email bombing or credential probing.
 */
export const otpRequestLimiter: Limiter = createFixedWindowLimiter({
  name: "otp:request",
  maxAttempts: 3,
  windowMs: 900_000,
});

/**
 * OTP verification: 5 attempts per 10 minutes per (client, email). Complements
 * the database-backed per-challenge attempt cap enforced by OtpService.
 */
export const otpVerifyLimiter: Limiter = createFixedWindowLimiter({
  name: "otp:verify",
  maxAttempts: 5,
  windowMs: 600_000,
});
