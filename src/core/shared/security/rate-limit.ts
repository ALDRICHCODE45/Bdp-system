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
  maxAttempts: number;
  windowMs: number;
}): Limiter {
  const { maxAttempts, windowMs } = params;

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
      const existing = buckets.get(key);

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
        buckets.set(key, { count: 1, resetAt: now + windowMs });
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
      buckets.delete(key);
    },
  };
}

/** Trim whitespace and lowercase for use in limiter keys. */
export function normalizeEmail(s: string): string {
  return s.trim().toLowerCase();
}

/** Credentials login: 5 attempts per 10 minutes per (ip, email). */
export const loginLimiter: Limiter = createFixedWindowLimiter({
  maxAttempts: 5,
  windowMs: 600_000,
});

/** Public QR attendance action: 2 attempts per minute per correo. */
export const asistenciaPublicThrottle: Limiter = createFixedWindowLimiter({
  maxAttempts: 2,
  windowMs: 60_000,
});