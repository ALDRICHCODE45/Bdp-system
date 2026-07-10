/**
 * scripts/migrate-file-acl.ts
 * --------------------------------------------------------------------------
 * One-shot backfill for the `secure-file-access` change.
 *
 * What this script does
 * ---------------------
 * For every legacy row in any of the registered "direct-URL" columns
 * (currently `FileAttachment.fileUrl` and `Factura.facturaUrl`) whose
 * value still starts with `http`, this script:
 *   (a) derives the object KEY from the stored public URL,
 *   (b) persists the original public URL into the matching `originalXxx`
 *       rollback column (idempotent — no-op if already set),
 *   (c) issues `PutObjectAclCommand(Bucket, Key=key, ACL="private")` against
 *       DigitalOcean Spaces (idempotent — re-issuing is harmless),
 *   (d) rewrites the live column to the bare key (idempotent — guarded by
 *       a `where: { [column]: legacyUrl }` Prisma clause so a re-run
 *       cannot clobber a row that already moved on).
 *
 * Why two columns (not just one)
 * ------------------------------
 * `Factura.facturaUrl` predates the `FileAttachment` system and was never
 * refactored to go through it. The SAT PDF for a Factura is uploaded
 * directly to Spaces via `uploadToSpacesAction` (see
 * `src/features/Files/server/actions/uploadToSpacesAction.ts`) and the
 * returned URL/key is written straight to `Factura.facturaUrl`. When the
 * bucket ACL flips to private in Phase 7, those rows 401 unless we
 * rewrite them to bare keys the same way `FileAttachment.fileUrl` was
 * rewritten. This script treats both columns as parallel migration
 * targets — single run, one summary, fail-soft per row.
 *
 * Crash-safety contract
 * ----------------------
 * If we crash between any two of (b)/(c)/(d), the row still has a
 * live-column value that starts with `http`, so on re-run it is detected
 * as legacy and reprocessed end-to-end. Steps (b) and (d) are guarded at
 * the SQL level; step (c) is idempotent at the API level. Result: a
 * re-run always converges and is never destructive.
 *
 * Modes
 * -----
 *   --dry-run                  Print counts + sample rows. NO writes
 *                              (neither DB nor Spaces). Default-ish mode
 *                              for the user to inspect before going live.
 *   --revert                   Reverse an already-applied migration. Rows
 *                              with a non-null `originalXxx` column get
 *                              `ACL="public-read"` and their live column
 *                              restored to the original public URL, then
 *                              `originalXxx` is cleared. Idempotent —
 *                              running --revert twice is a no-op on the
 *                              second pass.
 *   --from-id N                Start scanning from id > N (manual resume
 *                              after inspecting the checkpoint file).
 *   --batch-size N             Rows per Prisma page (default 50).
 *   --limit N                  Process at most N rows total (safety cap).
 *   --self-test                Run the key-derivation self-check (no DB,
 *                              no Spaces; exits 0 on pass / 1 on mismatch).
 *                              Use to verify the path-style fix in any
 *                              environment without external side effects.
 *   --confirm-prod-write       Required when NODE_ENV=production AND not a
 *                              dry run. Refuses to write otherwise.
 *
 * HARD ship-order prerequisite
 * ----------------------------
 * This script MUST be run ONLY AFTER:
 *   1. BOTH slice-1 Prisma migrations have been deployed to prod via
 *      `bun run prisma:deploy`:
 *        - `20260709150000_add_file_original_url`
 *            → `FileAttachment.originalFileUrl`
 *        - `20260709205723_add_factura_original_url`
 *            → `Factura.originalFacturaUrl`
 *      These columns must exist in prod BEFORE we flip any ACLs;
 *      otherwise the revert path is impossible and we would have to
 *      keep the legacy public ACL forever.
 *   2. BOTH presigned-read paths are live in prod:
 *        - `getFilePresignedUrlAction(fileId)` for `FileAttachment` rows
 *        - `getFacturaPdfPresignedUrlAction(facturaId)` for `Factura`
 *          rows whose `facturaUrl` is a bare key
 *      Once we flip an ACL to private, the only way for a legitimate
 *      user to read that object is via the matching presign action —
 *      direct public URLs will return HTTP 403 (this is by design — see
 *      spec scenario "Old public link returns 403" and the
 *      "Cutover — Legacy Public Links 403" requirement).
 *
 * The CLI does a pre-flight check that every `originalXxx` column is
 * selectable through the Prisma client and aborts with a clear error if
 * any one is missing. We do not auto-detect prod vs. local — the user
 * is the operator and reads the header above.
 *
 * Exact command sequence the user runs
 * ------------------------------------
 *   # 1. Dry run first (Phase 6 verification):
 *   bun run migrate:file-acl --dry-run
 *
 *   # 2. Real run (Phase 7 backfill):
 *   bun run migrate:file-acl
 *   # (add --confirm-prod-write when NODE_ENV=production)
 *
 *   # 3. Emergency revert (only if viewing breaks):
 *   bun run migrate:file-acl --revert
 *   # (add --confirm-prod-write when NODE_ENV=production)
 *
 *   # 4. Resumability helpers (optional):
 *   bun run migrate:file-acl --from-id 12345 --limit 1000
 *   # the script writes scripts/.migrate-file-acl.cp.json with the last
 *   # successful batch id; --from-id is the way to skip past it.
 *
 * Resumability
 * ------------
 * Idempotency alone makes every re-run safe. The checkpoint file
 * (scripts/.migrate-file-acl.cp.json) is written after every successful
 * batch and is INFORMATIONAL — it lets the user pass --from-id on a
 * later run. It is safe to delete; safe to leave around; safe to commit
 * (no secrets). It is gitignored so each developer's last-id does not
 * leak via git.
 * --------------------------------------------------------------------------
 */

import { PrismaClient } from "@prisma/client";
import { PutObjectAclCommand, S3Client } from "@aws-sdk/client-s3";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

// ---------------------------------------------------------------------------
// Migration targets
// ---------------------------------------------------------------------------
//
// One entry per direct-URL column. Adding a new target = add an entry
// here + ship a Prisma migration that adds the matching `originalXxx`
// rollback column. The target descriptor carries the Prisma accessor,
// the live column, the rollback column, and a human label used in
// summary logging.
//
// `legacyDetection` deliberately keeps using `startsWith("http")` (not
// `startsWith("https")`) so we keep detecting the same rows the slice-5
// script already migrated, even if a future change tightens the
// presigned-URL helper to require https.
// ---------------------------------------------------------------------------

interface MigrationTarget {
  /** Human label for summary logs and error messages. */
  readonly label: string;
  /** Prisma client accessor (camelCase of the model name). */
  readonly model: "fileAttachment" | "factura";
  /** Live URL/key column on the row. */
  readonly urlField: "fileUrl" | "facturaUrl";
  /** Nullable rollback column added by the matching Prisma migration. */
  readonly originalUrlField: "originalFileUrl" | "originalFacturaUrl";
}

const TARGETS: readonly MigrationTarget[] = [
  {
    label: "FileAttachment.fileUrl",
    model: "fileAttachment",
    urlField: "fileUrl",
    originalUrlField: "originalFileUrl",
  },
  {
    label: "Factura.facturaUrl",
    model: "factura",
    urlField: "facturaUrl",
    originalUrlField: "originalFacturaUrl",
  },
] as const;

// ---------------------------------------------------------------------------
// CLI parsing (no external dep — minimal flag surface)
// ---------------------------------------------------------------------------

interface CliArgs {
  dryRun: boolean;
  revert: boolean;
  fromId: string | null;
  batchSize: number;
  limit: number | null;
  selfTest: boolean;
  confirmProdWrite: boolean;
}

function parseArgs(argv: readonly string[]): CliArgs {
  const args: CliArgs = {
    dryRun: false,
    revert: false,
    fromId: null,
    batchSize: 50,
    limit: null,
    selfTest: false,
    confirmProdWrite: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const flag = argv[i];
    const next = argv[i + 1];
    switch (flag) {
      case "--dry-run":
        args.dryRun = true;
        break;
      case "--revert":
        args.revert = true;
        break;
      case "--confirm-prod-write":
        args.confirmProdWrite = true;
        break;
      case "--self-test":
        args.selfTest = true;
        break;
      case "--from-id": {
        if (!next) throw new Error("--from-id requires a value");
        args.fromId = String(next);
        i++;
        break;
      }
      case "--batch-size": {
        if (!next) throw new Error("--batch-size requires a numeric value");
        const n = Number(next);
        if (!Number.isInteger(n) || n < 1 || n > 1000) {
          throw new Error(`--batch-size must be 1..1000 (got: ${next})`);
        }
        args.batchSize = n;
        i++;
        break;
      }
      case "--limit": {
        if (!next) throw new Error("--limit requires a numeric value");
        const n = Number(next);
        if (!Number.isInteger(n) || n < 1) {
          throw new Error(`--limit must be a positive integer (got: ${next})`);
        }
        args.limit = n;
        i++;
        break;
      }
      case "--help":
      case "-h":
        printUsage();
        process.exit(0);
        break;
      default:
        if (flag?.startsWith("-")) {
          throw new Error(`Unknown flag: ${flag}. Run with --help for usage.`);
        }
        break;
    }
  }

  if (args.dryRun && args.revert) {
    throw new Error("--dry-run and --revert are mutually exclusive");
  }

  if (args.selfTest && (args.dryRun || args.revert || args.fromId != null || args.limit != null)) {
    throw new Error(
      "--self-test must be used alone (no other mode flags) — " +
        "it does not touch the DB or Spaces"
    );
  }

  return args;
}

function printUsage(): void {
  console.log(`Usage: bun run scripts/migrate-file-acl.ts [flags]

Flags:
  --dry-run                   Print counts + sample rows. NO writes.
  --revert                    Reverse an applied migration. Idempotent.
  --from-id <uuid>            Start scanning from id > <uuid> (manual resume).
  --batch-size N              Rows per Prisma page (default 50, max 1000).
  --limit N                   Process at most N rows total.
  --self-test                 Key-derivation self-check (no DB, no Spaces).
  --confirm-prod-write        Required when NODE_ENV=production (non-dry).

Targets:
  ${TARGETS.map((t) => t.label).join("\n  ")}

See header comment for the mandatory ship-order prerequisites.`);
}

// ---------------------------------------------------------------------------
// Env parsing — only the DO_* vars this script actually needs.
// We deliberately do NOT import @/core/shared/config/env.config because that
// module validates auth/NEXTAUTH_URL, which has no bearing on a storage
// migration and would block this script from running in shells where the
// Node NextAuth env is not provisioned.
// ---------------------------------------------------------------------------

interface SpacesEnv {
  bucket: string;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

function parseSpacesEnv(): SpacesEnv {
  const get = (name: string): string => {
    const value = process.env[name];
    if (!value || value.trim() === "") {
      throw new Error(`Missing required env var: ${name}`);
    }
    return value;
  };

  let endpoint: string;
  try {
    endpoint = get("DO_SPACES_ENDPOINT");
    new URL(endpoint); // validates and is then unused; throw on invalid
  } catch {
    throw new Error(`DO_SPACES_ENDPOINT must be a valid URL`);
  }

  return {
    bucket: get("DO_SPACES_BUCKET"),
    endpoint,
    region: get("DO_SPACES_REGION"),
    accessKeyId: get("DO_ACCESS_KEY"),
    secretAccessKey: get("DO_SECRET_KEY"),
  };
}

// ---------------------------------------------------------------------------
// S3Client builder — mirrors DigitalOceanSpacesService ctor so ACL flips
// hit the same endpoint as uploads.
// ---------------------------------------------------------------------------

function buildSpacesClient(env: SpacesEnv): S3Client {
  // Mirror the DigitalOceanSpacesService ctor: strip the bucket prefix
  // from the endpoint host if present, then build a path-style client.
  const endpointUrl = new URL(env.endpoint);
  const hostnameParts = endpointUrl.hostname.split(".");
  if (hostnameParts[0] === env.bucket) hostnameParts.shift();
  const baseEndpoint = `${endpointUrl.protocol}//${hostnameParts.join(".")}`;

  return new S3Client({
    endpoint: baseEndpoint,
    region: env.region,
    credentials: {
      accessKeyId: env.accessKeyId,
      secretAccessKey: env.secretAccessKey,
    },
    forcePathStyle: true,
  });
}

// ---------------------------------------------------------------------------
// Key derivation: legacy public URL → object key
//
// Production legacy rows have been written in TWO URL styles (this is the
// bug fixed by the `fix(files): derive bucket-relative key from path-style
// Spaces URLs in backfill` commit — see header comment for context):
//
//   1. Path-style (the form observed in prod by the dry-run that surfaced
//      the original bug):
//        https://<region>.digitaloceanspaces.com/<bucket>/<key>
//        e.g. https://sfo3.digitaloceanspaces.com/bdpsystem/facturas/1774…pdf
//      → strip the leading `/<bucket>/` segment so the returned key is
//        bucket-relative. Returning `bdpsystem/facturas/1774…pdf` here
//        would make PutObjectAclCommand target
//        `bdpsystem/bdpsystem/facturas/…` which does not exist → NoSuchKey
//        surfaced in prod as the cryptic `UnknownError`.
//
//   2. Virtual-hosted-style (the form the previous version of this script
//      assumed, kept here for completeness):
//        https://<bucket>.<region>.digitaloceanspaces.com/<key>
//        e.g. https://bdpsystem.sfo3.digitaloceanspaces.com/facturas/1234-abcd.pdf
//      → the path is already bucket-relative; use as-is.
//
// Style detection: virtual-hosted iff the hostname equals the bucket or
// starts with `<bucket>.`. Everything else is path-style. This is the
// disambiguation that the previous version of this function was missing.
//
// The returned key MUST match the canonical bucket-relative form that
// `DigitalOceanSpacesService.uploadFile` returns and that
// `getPresignedGetUrl(key)` (and `GetObjectCommand({ Key })`) consumes —
// i.e. the same form the new-upload code stores in
// `FileAttachment.fileUrl` / `Factura.facturaUrl` post-`1bf2216`.
// ---------------------------------------------------------------------------

function deriveKeyFromLegacyUrl(legacyUrl: string, bucket: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(legacyUrl);
  } catch {
    return null;
  }

  // Trim leading/trailing slashes from the pathname. Query strings and
  // fragments are discarded by `parsed.pathname` (URL class behaviour).
  const rawPath = decodeURIComponent(parsed.pathname)
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
  if (rawPath === "") return null;

  // Sanity: legacy key must NOT contain another URL — bare key only.
  if (rawPath.startsWith("http")) return null;

  const host = parsed.hostname.toLowerCase();
  const bucketLc = bucket.toLowerCase();

  // (1) Virtual-hosted: bucket is a subdomain prefix of the host. The
  // path is already bucket-relative — use it as-is.
  if (host === bucketLc || host.startsWith(`${bucketLc}.`)) {
    return rawPath;
  }

  // (2) Path-style: bucket is the first path segment. Strip it so the
  // returned key is bucket-relative and matches what
  // `DigitalOceanSpacesService` expects.
  const segments = rawPath.split("/");
  if (segments[0]?.toLowerCase() === bucketLc) {
    const stripped = segments.slice(1).join("/");
    return stripped === "" ? null : stripped;
  }

  // (3) Off-spec: hostname is neither virtual-hosted for this bucket nor
  // path-style with this bucket as the first segment. Trust the raw path
  // and let the S3 call surface the mismatch (NoSuchKey / AccessDenied)
  // — better than a hard fail on a row that may have been written by an
  // out-of-band toolchain. This preserves the original "warn but trust"
  // behaviour for unexpected URL shapes.
  return rawPath;
}

// ---------------------------------------------------------------------------
// AWS SDK error formatter
//
// AWS SDK v3 errors (`S3ServiceException` / its subclasses like `NoSuchKey`,
// `AccessDenied`, `SignatureDoesNotMatch`) carry the diagnostic info on
// `name`, `$metadata.httpStatusCode`, and `message`. The previous version
// of this script only surfaced `err.message`, which for a `NoSuchKey`
// (the very error the path-style bug produced in prod) tends to be
// opaque or empty and was being reported as `reason=UnknownError`. This
// formatter collapses the structured fields into a single, grep-friendly
// line so the operator can act on the next run without spelunking
// through SDK internals.
// ---------------------------------------------------------------------------

function formatMigrationError(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as {
      name?: string;
      message?: string;
      $metadata?: { httpStatusCode?: number; requestId?: string };
      $fault?: "client" | "server";
      Code?: string;
    };
    // AWS SDK v3 ServiceException fingerprint: the exception always
    // carries `$metadata` (required by `MetadataBearer`) and/or `$fault`
    // (required by `ServiceException`). Requiring one of those — rather
    // than `name` — is what keeps a plain `new Error("boom")` from
    // being mis-classified as an AWS error just because it has
    // `Error.name === "Error"`.
    if (e.$metadata || e.$fault) {
      const name = e.Code ?? e.name ?? "UnknownError";
      const status = e.$metadata?.httpStatusCode ?? 0;
      const message = e.message ?? String(err);
      const parts: string[] = [`aws=${name}`, `http=${status}`];
      if (e.$fault) parts.push(`fault=${e.$fault}`);
      if (e.$metadata?.requestId) parts.push(`requestId=${e.$metadata.requestId}`);
      parts.push(`message=${message}`);
      return parts.join(" ");
    }
    if (typeof e.message === "string" && e.message.length > 0) return e.message;
  }
  return String(err);
}

// ---------------------------------------------------------------------------
// Self-test
//
// Runs a battery of URL→key derivations plus AWS-error formatting checks
// without touching the DB or Spaces. Invoked via `bun run migrate:file-acl
// --self-test`. Exits 0 on full pass, 1 on any mismatch. The operator can
// re-run this in any environment to confirm the path-style fix is in
// place after a deploy or a refactor.
// ---------------------------------------------------------------------------

interface SelfTestCase {
  readonly name: string;
  readonly run: () => void;
}

function runSelfTest(): void {
  const bucket = "bdpsystem";
  const cases: SelfTestCase[] = [
    {
      name: "path-style: actual prod URL (the regression case)",
      run: () => {
        const url =
          "https://sfo3.digitaloceanspaces.com/bdpsystem/facturas/" +
          "1774462619913-455222ea-36cb-4b91-9e1c-6d67d1769a9d.pdf";
        const expected = "facturas/1774462619913-455222ea-36cb-4b91-9e1c-6d67d1769a9d.pdf";
        const got = deriveKeyFromLegacyUrl(url, bucket);
        if (got !== expected) {
          throw new Error(`expected "${expected}", got "${String(got)}"`);
        }
      },
    },
    {
      name: "virtual-hosted-style: bucket is a subdomain prefix",
      run: () => {
        const url = "https://bdpsystem.sfo3.digitaloceanspaces.com/facturas/1234-abcd.pdf";
        const expected = "facturas/1234-abcd.pdf";
        const got = deriveKeyFromLegacyUrl(url, bucket);
        if (got !== expected) {
          throw new Error(`expected "${expected}", got "${String(got)}"`);
        }
      },
    },
    {
      name: "path-style: preserves nested key segments",
      run: () => {
        const url =
          "https://sfo3.digitaloceanspaces.com/bdpsystem/movimientos/2026/07/123.pdf";
        const expected = "movimientos/2026/07/123.pdf";
        const got = deriveKeyFromLegacyUrl(url, bucket);
        if (got !== expected) {
          throw new Error(`expected "${expected}", got "${String(got)}"`);
        }
      },
    },
    {
      name: "path-style: key that happens to start with the bucket name",
      run: () => {
        // Edge case: a top-level folder named `bdpsystem` inside the
        // `bdpsystem` bucket. The first segment is the bucket, the second
        // is the folder — strip exactly one segment.
        const url = "https://sfo3.digitaloceanspaces.com/bdpsystem/bdpsystem/xxx.pdf";
        const expected = "bdpsystem/xxx.pdf";
        const got = deriveKeyFromLegacyUrl(url, bucket);
        if (got !== expected) {
          throw new Error(`expected "${expected}", got "${String(got)}"`);
        }
      },
    },
    {
      name: "path-style: query string is discarded",
      run: () => {
        const url =
          "https://sfo3.digitaloceanspaces.com/bdpsystem/facturas/abc.pdf?versionId=42";
        const expected = "facturas/abc.pdf";
        const got = deriveKeyFromLegacyUrl(url, bucket);
        if (got !== expected) {
          throw new Error(`expected "${expected}", got "${String(got)}"`);
        }
      },
    },
    {
      name: "path-style: percent-encoded path is decoded",
      run: () => {
        const url =
          "https://sfo3.digitaloceanspaces.com/bdpsystem/facturas/file%20with%20space.pdf";
        const expected = "facturas/file with space.pdf";
        const got = deriveKeyFromLegacyUrl(url, bucket);
        if (got !== expected) {
          throw new Error(`expected "${expected}", got "${String(got)}"`);
        }
      },
    },
    {
      name: "virtual-hosted-style: case-insensitive bucket match",
      run: () => {
        const url = "https://BDPSystem.sfo3.digitaloceanspaces.com/facturas/abc.pdf";
        const expected = "facturas/abc.pdf";
        const got = deriveKeyFromLegacyUrl(url, bucket);
        if (got !== expected) {
          throw new Error(`expected "${expected}", got "${String(got)}"`);
        }
      },
    },
    {
      name: "off-spec: first segment is not the bucket → trust raw path",
      run: () => {
        // E.g. a stale row from a toolchain that used a different bucket
        // name. We don't fail hard; we trust the path so the S3 call
        // surfaces NoSuchKey with the operator's actual key.
        const url = "https://sfo3.digitaloceanspaces.com/legacy-bucket/facturas/abc.pdf";
        const got = deriveKeyFromLegacyUrl(url, bucket);
        if (got !== "legacy-bucket/facturas/abc.pdf") {
          throw new Error(`expected off-spec passthrough, got "${String(got)}"`);
        }
      },
    },
    {
      name: "invalid URL string returns null",
      run: () => {
        const got = deriveKeyFromLegacyUrl("not a url", bucket);
        if (got !== null) {
          throw new Error(`expected null, got "${String(got)}"`);
        }
      },
    },
    {
      name: "empty pathname returns null",
      run: () => {
        const got = deriveKeyFromLegacyUrl("https://sfo3.digitaloceanspaces.com/", bucket);
        if (got !== null) {
          throw new Error(`expected null, got "${String(got)}"`);
        }
      },
    },
    {
      name: "formatMigrationError surfaces AWS S3 NoSuchKey shape",
      run: () => {
        // Synthesise the shape AWS SDK v3 actually throws for NoSuchKey.
        const fakeErr: { name: string; message: string; $metadata: { httpStatusCode: number; requestId: string }; $fault: "client" } = {
          name: "NoSuchKey",
          message: "The specified key does not exist.",
          $metadata: { httpStatusCode: 404, requestId: "req-abc-123" },
          $fault: "client",
        };
        const got = formatMigrationError(fakeErr);
        if (!got.includes("aws=NoSuchKey")) {
          throw new Error(`expected aws=NoSuchKey in formatted string, got: ${got}`);
        }
        if (!got.includes("http=404")) {
          throw new Error(`expected http=404 in formatted string, got: ${got}`);
        }
        if (!got.includes("The specified key does not exist.")) {
          throw new Error(`expected original message, got: ${got}`);
        }
      },
    },
    {
      name: "formatMigrationError surfaces SignatureDoesNotMatch shape",
      run: () => {
        const fakeErr = {
          name: "SignatureDoesNotMatch",
          message: "The request signature we calculated does not match the signature you provided.",
          $metadata: { httpStatusCode: 403, requestId: "req-def-456" },
          $fault: "client",
        };
        const got = formatMigrationError(fakeErr);
        if (!got.includes("aws=SignatureDoesNotMatch") || !got.includes("http=403")) {
          throw new Error(`expected aws=SignatureDoesNotMatch http=403, got: ${got}`);
        }
      },
    },
    {
      name: "formatMigrationError falls back for non-AWS errors",
      run: () => {
        const got = formatMigrationError(new Error("boom"));
        if (got !== "boom") {
          throw new Error(`expected "boom", got: ${got}`);
        }
      },
    },
    {
      name: "formatMigrationError handles non-object throw values",
      run: () => {
        const got = formatMigrationError("plain string thrown");
        if (got !== "plain string thrown") {
          throw new Error(`expected passthrough, got: ${got}`);
        }
      },
    },
  ];

  let pass = 0;
  const failures: Array<{ name: string; message: string }> = [];
  for (const c of cases) {
    try {
      c.run();
      pass++;
      console.log(`  ok   ${c.name}`);
    } catch (err) {
      failures.push({ name: c.name, message: formatMigrationError(err) });
      console.error(`  FAIL ${c.name}: ${formatMigrationError(err)}`);
    }
  }
  console.log("");
  console.log(`Self-test: ${pass}/${cases.length} passed`);
  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------------------
// Exponential backoff for transient DO Spaces errors.
// Only retries when the API returns a retryable shape; throws immediately
// for 4xx-permission errors (those will never recover by retrying).
// ---------------------------------------------------------------------------

const TRANSIENT_ERROR_NAMES = new Set([
  "SlowDown",
  "TooManyRequests",
  "RequestTimeout",
  "InternalError",
  "ServiceUnavailable",
  "Throttling",
  "RequestThrottled",
]);

const MAX_BACKOFF_MS = 8_000;
const BASE_BACKOFF_MS = 500;

async function withBackoff<T>(
  fn: () => Promise<T>,
  label: string,
  logger: (msg: string) => void
): Promise<T> {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
      const status = e.$metadata?.httpStatusCode ?? 0;
      const transient =
        (typeof e.name === "string" && TRANSIENT_ERROR_NAMES.has(e.name)) ||
        status === 429 ||
        status === 503 ||
        status === 500;

      if (!transient || attempt >= 5) {
        throw err;
      }

      const delay = Math.min(BASE_BACKOFF_MS * 2 ** attempt, MAX_BACKOFF_MS);
      // Use the AWS-aware formatter so transient retry lines carry the
      // same diagnostic shape (aws=<name> http=<status> …) as the
      // final failure reason — the operator can grep one pattern across
      // the whole run.
      logger(
        `${label} transient error ${formatMigrationError(err)}; retry ${
          attempt + 1
        }/5 in ${delay}ms`
      );
      await sleep(delay);
      attempt++;
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Checkpoint file (informational; idempotency is the real safety net)
// ---------------------------------------------------------------------------

interface Checkpoint {
  lastId: string | null;
  mode: "migrate" | "revert" | "dry-run";
  targets: readonly string[];
  updatedAt: string;
}

const CHECKPOINT_PATH = "scripts/.migrate-file-acl.cp.json";

async function readCheckpoint(): Promise<Checkpoint | null> {
  try {
    const raw = await readFile(CHECKPOINT_PATH, "utf8");
    const data = JSON.parse(raw) as unknown;
    if (data && typeof data === "object" && "lastId" in data) {
      return data as Checkpoint;
    }
    return null;
  } catch {
    return null;
  }
}

async function writeCheckpoint(cp: Checkpoint): Promise<void> {
  try {
    await mkdir(dirname(CHECKPOINT_PATH), { recursive: true });
    await writeFile(CHECKPOINT_PATH, JSON.stringify(cp, null, 2), "utf8");
  } catch {
    // Checkpoint failure must never abort the migration. Log only.
    console.warn(`[warn] could not write checkpoint file ${CHECKPOINT_PATH}`);
  }
}

// ---------------------------------------------------------------------------
// Row-level operations — typed over a generic row shape so the same
// helpers work for any target's (id, currentUrl, originalUrl) trio.
// ---------------------------------------------------------------------------

interface RowShape {
  id: string;
  currentUrl: string;
  originalUrl: string | null;
}

async function migrateRow(
  row: RowShape,
  target: MigrationTarget,
  s3: S3Client,
  bucket: string,
  args: CliArgs,
  logger: (msg: string) => void
): Promise<{ newKey: string }> {
  const legacyUrl = row.currentUrl;
  const key = deriveKeyFromLegacyUrl(legacyUrl, bucket);
  if (!key) {
    throw new Error(`Could not derive key from legacy url: ${legacyUrl}`);
  }

  if (args.dryRun) {
    logger(`[dry-run] WOULD migrate ${target.label} id=${row.id} key=${key}`);
    return { newKey: key };
  }

  // (b) Save originalUrl (idempotent — only writes when currently null).
  if (row.originalUrl == null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any)[target.model].updateMany({
      where: { id: row.id, [target.originalUrlField]: null },
      data: { [target.originalUrlField]: legacyUrl },
    });
  }

  // (c) Flip ACL to private. Idempotent — DO Spaces accepts repeated PUTs.
  await withBackoff(
    async () =>
      s3.send(
        new PutObjectAclCommand({
          Bucket: bucket,
          Key: key,
          ACL: "private",
        })
      ),
    `acl-flip ${target.label} id=${row.id}`,
    logger
  );

  // (d) Update the live column to the bare key. Guarded by
  // `currentUrl: legacyUrl` so a parallel run cannot clobber a row that
  // already moved on.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any)[target.model].updateMany({
    where: { id: row.id, [target.urlField]: legacyUrl },
    data: { [target.urlField]: key },
  });

  logger(`migrated ${target.label} id=${row.id} key=${key}`);
  return { newKey: key };
}

async function revertRow(
  row: RowShape,
  target: MigrationTarget,
  s3: S3Client,
  bucket: string,
  args: CliArgs,
  logger: (msg: string) => void
): Promise<void> {
  const originalUrl = row.originalUrl;
  if (!originalUrl) {
    // Should not happen — caller filters on originalUrl != null — but
    // fail soft and skip rather than blow up.
    logger(`[skip-revert] ${target.label} id=${row.id} has null ${target.originalUrlField}`);
    return;
  }

  const key = deriveKeyFromLegacyUrl(row.currentUrl, bucket);
  if (!key) {
    throw new Error(`Could not derive key from current ${target.urlField}: ${row.currentUrl}`);
  }

  if (args.dryRun) {
    logger(
      `[dry-run] WOULD revert ${target.label} id=${row.id} key=${key} → url=${originalUrl.slice(0, 80)}...`
    );
    return;
  }

  // (c) ACL back to public-read.
  await withBackoff(
    async () =>
      s3.send(
        new PutObjectAclCommand({
          Bucket: bucket,
          Key: key,
          ACL: "public-read",
        })
      ),
    `revert-acl ${target.label} id=${row.id}`,
    logger
  );

  // (d) Restore the live column, clear the rollback column. Guarded so a
  // concurrent run does not double-write.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any)[target.model].updateMany({
    where: { id: row.id, [target.urlField]: row.currentUrl },
    data: {
      [target.urlField]: originalUrl,
      [target.originalUrlField]: null,
    },
  });

  logger(`reverted ${target.label} id=${row.id} → ${originalUrl.slice(0, 80)}...`);
}

// ---------------------------------------------------------------------------
// Target processing — one target end-to-end (migrate OR revert).
// ---------------------------------------------------------------------------

interface TargetStats {
  label: string;
  processed: number;
  migrated: number;
  failed: number;
  samples: Array<Record<string, unknown>>;
  failures: Array<{ id: string; reason: string }>;
  lastCursor: string | null;
}

async function processTarget(
  target: MigrationTarget,
  args: CliArgs,
  s3: S3Client,
  env: SpacesEnv,
  logger: (msg: string) => void
): Promise<TargetStats> {
  const stats: TargetStats = {
    label: target.label,
    processed: 0,
    migrated: 0,
    failed: 0,
    samples: [],
    failures: [],
    lastCursor: null,
  };

  // Cursor scoping per target: --from-id applies to the FIRST target
  // (FileAttachment, the historical one) and subsequent targets start
  // fresh. This preserves the original script's resume semantics for
  // existing operators while keeping Factura's migration deterministic.
  let cursor: string | null = args.fromId;
  const limitRemaining = (): boolean => args.limit == null || stats.processed < args.limit;

  for (;;) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accessor = (prisma as any)[target.model];

    const where: Record<string, unknown> = args.revert
      ? { [target.originalUrlField]: { not: null } }
      : { [target.urlField]: { startsWith: "http" } };

    const rows: Array<{ id: string }> = await accessor.findMany({
      where,
      orderBy: { id: "asc" },
      take: args.batchSize,
      ...(cursor != null ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    if (rows.length === 0) break;

    for (const row of rows) {
      if (!limitRemaining()) {
        logger(
          `[limit=${args.limit}] reached on ${target.label}. stopping this target.`
        );
        break;
      }

      // Re-fetch each row individually so we get the up-to-date
      // currentUrl / originalUrl without having to type the joined
      // findMany return. Cheap (single-row PK lookup) and keeps the
      // helper functions generic.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fresh: any = await accessor.findUnique({
        where: { id: row.id },
        select: {
          id: true,
          [target.urlField]: true,
          [target.originalUrlField]: true,
        },
      });
      if (!fresh) {
        stats.failed++;
        stats.failures.push({ id: row.id, reason: "row vanished between cursor and re-fetch" });
        continue;
      }

      const shaped: RowShape = {
        id: fresh.id,
        currentUrl: fresh[target.urlField] ?? "",
        originalUrl: fresh[target.originalUrlField] ?? null,
      };

      stats.processed++;

      try {
        if (args.revert) {
          await revertRow(shaped, target, s3, env.bucket, args, logger);
        } else {
          const result = await migrateRow(shaped, target, s3, env.bucket, args, logger);
          if (args.dryRun && stats.samples.length < 5) {
            stats.samples.push({
              id: shaped.id,
              from: shaped.currentUrl,
              toKey: result.newKey,
            });
          }
        }
        stats.migrated++;
      } catch (err) {
        stats.failed++;
        // AWS-aware formatter: surfaces `aws=<name> http=<status> ...`
        // for S3 service exceptions (e.g. NoSuchKey, AccessDenied,
        // SignatureDoesNotMatch) and falls back to a plain string for
        // anything else. This replaces the prior `err.message ?? String(err)`
        // line that surfaced prod failures as the cryptic `UnknownError`.
        const reason = formatMigrationError(err);
        stats.failures.push({ id: shaped.id, reason });
        logger(`[fail] ${target.label} id=${shaped.id} reason=${reason}`);
        // Fail-soft: do not abort the whole run on a single row failure.
        continue;
      }

      stats.lastCursor = shaped.id;
      cursor = shaped.id;
    }

    if (!args.dryRun) {
      await writeCheckpoint({
        lastId: stats.lastCursor,
        mode: args.revert ? "revert" : args.dryRun ? "dry-run" : "migrate",
        targets: TARGETS.map((t) => t.label),
        updatedAt: new Date().toISOString(),
      });
    }

    if (!limitRemaining()) break;
  }

  return stats;
}

// ---------------------------------------------------------------------------
// Pre-flight: every target's rollback column must be selectable.
// ---------------------------------------------------------------------------

async function preflightAllTargets(): Promise<void> {
  for (const target of TARGETS) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const accessor = (prisma as any)[target.model];
      await accessor.findFirst({
        select: { id: true, [target.urlField]: true, [target.originalUrlField]: true },
      });
    } catch (err) {
      throw new Error(
        `Pre-flight failed: ${target.label} rollback column ` +
          `(${target.originalUrlField}) is not selectable. ` +
          `Run \`bun run prisma:deploy\` to deploy the matching migration ` +
          `(see the header comment for the list) BEFORE running this script. ` +
          `Underlying error: ${(err as Error).message}`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// Prisma is allocated lazily so the pre-flight check can run inside the
// same client instance without paying for a second connection.
let prisma: PrismaClient;

async function runMigrate(args: CliArgs, s3: S3Client, env: SpacesEnv): Promise<void> {
  const logger = (msg: string): void => {
    const ts = new Date().toISOString();
    console.log(`[${ts}] ${msg}`);
  };

  await preflightAllTargets();

  // Production write gate
  if (process.env.NODE_ENV === "production" && !args.dryRun && !args.confirmProdWrite) {
    throw new Error(
      "Refusing to write to prod without --confirm-prod-write. " +
        "Re-run with `--confirm-prod-write` after running `--dry-run` first."
    );
  }

  if (args.dryRun) {
    logger("[dry-run] no writes will be made to the DB or to Spaces");
  } else if (args.revert) {
    logger("[revert] flipping ACL back to public-read and restoring URLs");
  } else {
    logger("[migrate] flipping ACL to private and rewriting URLs to bare keys");
  }
  logger(`targets: ${TARGETS.map((t) => t.label).join(", ")}`);

  // Inform the user about any pre-existing checkpoint.
  if (!args.dryRun) {
    const cp = await readCheckpoint();
    if (cp) {
      logger(
        `Found checkpoint ${CHECKPOINT_PATH}: lastId=${cp.lastId} mode=${cp.mode} ` +
          `targets=[${cp.targets.join(", ")}] updatedAt=${cp.updatedAt}. ` +
          `Pass --from-id ${cp.lastId ?? 0} to skip it, or omit it to ` +
          `reprocess (idempotency handles already-migrated rows).`
      );
    }
  }

  // Process each target end-to-end. Targets run sequentially so a
  // failure on one (e.g. Spaces rate-limit on a hot folder) does not
  // skip the other — and so the summary log reads in a predictable
  // order.
  const allStats: TargetStats[] = [];
  for (const target of TARGETS) {
    logger(`--- target: ${target.label} ---`);
    const stats = await processTarget(target, args, s3, env, logger);
    allStats.push(stats);
  }

  logger("");
  logger("==== Summary ====");
  logger(`Mode:        ${args.dryRun ? "DRY-RUN" : args.revert ? "REVERT" : "MIGRATE"}`);
  logger(`Targets:     ${TARGETS.map((t) => t.label).join(", ")}`);
  let totalProcessed = 0;
  let totalMigrated = 0;
  let totalFailed = 0;
  for (const s of allStats) {
    logger(
      `  ${s.label.padEnd(28)} processed=${s.processed}  ` +
        `${args.revert ? "reverted" : "migrated"}=${s.migrated}  failed=${s.failed}`
    );
    totalProcessed += s.processed;
    totalMigrated += s.migrated;
    totalFailed += s.failed;
  }
  logger(
    `Totals:      processed=${totalProcessed}  ` +
      `${args.revert ? "reverted" : "migrated"}=${totalMigrated}  failed=${totalFailed}`
  );

  if (args.dryRun) {
    const samples = allStats.flatMap((s) => s.samples);
    if (samples.length > 0) {
      logger("");
      logger("Sample would-change rows (first 5 per target):");
      for (const s of samples) {
        logger(`  ${s.from}  →  ${s.toKey}`);
      }
    }
  }

  const allFailures = allStats.flatMap((s) => s.failures);
  if (allFailures.length > 0) {
    logger("");
    logger(`Failures (${allFailures.length}):`);
    for (const f of allFailures) logger(`  id=${f.id}  reason=${f.reason}`);
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  // Self-test is a pure unit check — no env, no DB, no Spaces. Run it
  // before touching Prisma so an operator in a misconfigured shell can
  // still verify the path-style fix landed correctly.
  if (args.selfTest) {
    runSelfTest();
    return;
  }

  const env = parseSpacesEnv();
  prisma = new PrismaClient();
  const s3 = buildSpacesClient(env);

  try {
    await runMigrate(args, s3, env);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: Error) => {
  console.error(`[fatal] ${err.message}`);
  process.exit(1);
});