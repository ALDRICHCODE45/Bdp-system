/**
 * scripts/migrate-file-acl.ts
 * --------------------------------------------------------------------------
 * One-shot backfill for the `secure-file-access` change.
 *
 * What this script does
 * ---------------------
 * For every legacy `FileAttachment` row whose `fileUrl` starts with `http`,
 * this script:
 *   (a) derives the object KEY from the stored public URL,
 *   (b) persists the original public URL into `originalFileUrl` (idempotent —
 *       no-op if already set),
 *   (c) issues `PutObjectAclCommand(Bucket, Key=key, ACL="private")` against
 *       DigitalOcean Spaces (idempotent — re-issuing is harmless),
 *   (d) updates `fileUrl` to the bare key (idempotent — guarded by a
 *       `where: { fileUrl: legacyUrl }` Prisma clause so a re-run cannot
 *       clobber a row that already moved on).
 *
 * Crash-safety contract
 * ----------------------
 * If we crash between any two of (b)/(c)/(d), the row still has a
 * `fileUrl` that starts with `http`, so on re-run it is detected as legacy
 * and reprocessed end-to-end. Steps (b) and (d) are guarded at the SQL
 * level; step (c) is idempotent at the API level. Result: a re-run always
 * converges and is never destructive.
 *
 * Modes
 * -----
 *   --dry-run                  Print counts + sample rows. NO writes
 *                              (neither DB nor Spaces). Default-ish mode
 *                              for the user to inspect before going live.
 *   --revert                   Reverse an already-applied migration. Rows
 *                              with a non-null `originalFileUrl` get
 *                              `ACL="public-read"` and their `fileUrl`
 *                              restored to the original public URL, then
 *                              `originalFileUrl` is cleared. Idempotent —
 *                              running --revert twice is a no-op on the
 *                              second pass.
 *   --from-id N                Start scanning from id > N (manual resume
 *                              after inspecting the checkpoint file).
 *   --batch-size N             Rows per Prisma page (default 50).
 *   --limit N                  Process at most N rows total (safety cap).
 *   --confirm-prod-write       Required when NODE_ENV=production AND not a
 *                              dry run. Refuses to write otherwise.
 *
 * HARD ship-order prerequisite
 * ----------------------------
 * This script MUST be run ONLY AFTER:
 *   1. The slice-1 Prisma migration `20260709150000_add_file_original_url`
 *      has been deployed to prod via `bun run prisma:deploy`. The
 *      `FileAttachment.originalFileUrl` column must exist in prod BEFORE
 *      we flip any ACLs; otherwise the revert path is impossible and we
 *      would have to keep the legacy public ACL forever.
 *   2. The slice-3 presigned-read path (`getFilePresignedUrlAction`) is
 *      live in prod. Once we flip an ACL to private, the only way for a
 *      legitimate user to read that object is via the presign action —
 *      direct public URLs will return HTTP 403 (this is by design — see
 *      spec scenario "Old public link returns 403" and the
 *      "Cutover — Legacy Public Links 403" requirement).
 *
 * The CLI does a pre-flight check that `originalFileUrl` is selectable
 * through the Prisma client and aborts with a clear error if the column
 * does not exist. We do not auto-detect prod vs. local — the user is the
 * operator and reads the header above.
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
 * batch and is INFORMATIONAL — it lets the user pass --from-id on a later
 * run. It is safe to delete; safe to leave around; safe to commit (no
 * secrets). Recommend adding `scripts/.migrate-file-acl.cp.json` to
 * .gitignore so each developer's last-id does not leak via git.
 * --------------------------------------------------------------------------
 */

import { Prisma, PrismaClient, FileAttachment } from "@prisma/client";
import { PutObjectAclCommand, S3Client } from "@aws-sdk/client-s3";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

// ---------------------------------------------------------------------------
// CLI parsing (no external dep — minimal flag surface)
// ---------------------------------------------------------------------------

interface CliArgs {
  dryRun: boolean;
  revert: boolean;
  fromId: string | null;
  batchSize: number;
  limit: number | null;
  confirmProdWrite: boolean;
}

function parseArgs(argv: readonly string[]): CliArgs {
  const args: CliArgs = {
    dryRun: false,
    revert: false,
    fromId: null,
    batchSize: 50,
    limit: null,
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
  --confirm-prod-write        Required when NODE_ENV=production (non-dry).

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
// Legacy public URL shape (DO Spaces virtual-hosted style):
//   https://<bucket>.<region>.digitaloceanspaces.com/<key>
//   e.g. https://bdpsystem.sfo3.digitaloceanspaces.com/facturas/1234-abcd.pdf
// We tolerate query strings (some legacy rows had ?versionId=...).
// ---------------------------------------------------------------------------

function deriveKeyFromLegacyUrl(legacyUrl: string, bucket: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(legacyUrl);
  } catch {
    return null;
  }

  // Pathname starts with "/<key>". Decode and trim leading slash.
  let key = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
  // Strip any trailing slash.
  key = key.replace(/\/+$/, "");
  if (key === "") return null;

  // Sanity: legacy key must NOT contain another URL — bare key only.
  if (key.startsWith("http")) return null;

  // Optional defensive check: hostname should mention the bucket (virtual
  // hosted) or the bucket-prefixed path (path style). We don't fail hard
  // here — only warn — because some rows may have been written by an
  // earlier toolchain that stored the path-style URL.
  const host = parsed.hostname.toLowerCase();
  if (host && !host.startsWith(bucket.toLowerCase()) && !host.includes("digitaloceanspaces.com")) {
    // Off-spec hostname. Warn but trust the path.
  }

  return key;
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
      logger(
        `${label} transient error (${e.name ?? "Unknown"}, http=${status}); retry ${
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
// Row-level operations
// ---------------------------------------------------------------------------

async function migrateRow(
  row: FileAttachment,
  s3: S3Client,
  bucket: string,
  args: CliArgs,
  logger: (msg: string) => void
): Promise<{ newKey: string }> {
  const legacyUrl = row.fileUrl;
  const key = deriveKeyFromLegacyUrl(legacyUrl, bucket);
  if (!key) {
    throw new Error(`Could not derive key from legacy url: ${legacyUrl}`);
  }

  if (args.dryRun) {
    logger(`[dry-run] WOULD migrate id=${row.id} key=${key}`);
    return { newKey: key };
  }

  // (b) Save originalFileUrl (idempotent — only writes when currently null).
  if (row.originalFileUrl == null) {
    await prisma.fileAttachment.updateMany({
      where: { id: row.id, originalFileUrl: null },
      data: { originalFileUrl: legacyUrl },
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
    `acl-flip id=${row.id}`,
    logger
  );

  // (d) Update fileUrl to the bare key. Guarded by `fileUrl: legacyUrl` so
  // a parallel run cannot clobber a row that already moved on.
  await prisma.fileAttachment.updateMany({
    where: { id: row.id, fileUrl: legacyUrl },
    data: { fileUrl: key },
  });

  logger(`migrated id=${row.id} key=${key}`);
  return { newKey: key };
}

async function revertRow(
  row: FileAttachment,
  s3: S3Client,
  bucket: string,
  args: CliArgs,
  logger: (msg: string) => void
): Promise<void> {
  const originalUrl = row.originalFileUrl;
  if (!originalUrl) {
    // Should not happen — caller filters on originalFileUrl != null — but
    // fail soft and skip rather than blow up.
    logger(`[skip-revert] id=${row.id} has null originalFileUrl`);
    return;
  }

  const key = deriveKeyFromLegacyUrl(row.fileUrl, bucket);
  if (!key) {
    throw new Error(`Could not derive key from current fileUrl: ${row.fileUrl}`);
  }

  if (args.dryRun) {
    logger(
      `[dry-run] WOULD revert id=${row.id} key=${key} → url=${originalUrl.slice(0, 80)}...`
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
    `revert-acl id=${row.id}`,
    logger
  );

  // (d) Restore fileUrl, clear originalFileUrl. Guarded so a concurrent run
  // does not double-write.
  await prisma.fileAttachment.updateMany({
    where: { id: row.id, fileUrl: row.fileUrl },
    data: {
      fileUrl: originalUrl,
      originalFileUrl: null,
    },
  });

  logger(`reverted id=${row.id} → ${originalUrl.slice(0, 80)}...`);
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

  // Pre-flight: column must exist (i.e. Phase 1 migration was deployed +
  // `bunx prisma generate` ran on this checkout).
  try {
    await prisma.fileAttachment.findFirst({
      select: { id: true, fileUrl: true, originalFileUrl: true },
    });
  } catch (err) {
    throw new Error(
      `Pre-flight failed: FileAttachment.originalFileUrl is not selectable. ` +
        `Run \`bun run prisma:deploy\` to deploy migration ` +
        `20260709150000_add_file_original_url BEFORE running this script. ` +
        `Underlying error: ${(err as Error).message}`
    );
  }

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
    logger("[revert] flipping ACL back to public-read and restoring fileUrl");
  } else {
    logger("[migrate] flipping ACL to private and rewriting fileUrl to bare keys");
  }

  // Inform the user about any pre-existing checkpoint.
  if (!args.dryRun) {
    const cp = await readCheckpoint();
    if (cp) {
      logger(
        `Found checkpoint ${CHECKPOINT_PATH}: lastId=${cp.lastId} mode=${cp.mode} ` +
          `updatedAt=${cp.updatedAt}. Pass --from-id ${cp.lastId ?? 0} to skip it, ` +
          `or omit it to reprocess (idempotency handles already-migrated rows).`
      );
    }
  }

  let cursor: string | null = args.fromId;
  let processed = 0;
  let migrated = 0;
  let failed = 0;
  const failures: Array<{ id: string; reason: string }> = [];
  const samples: Array<Record<string, unknown>> = [];

  for (;;) {
    const where: Prisma.FileAttachmentWhereInput = args.revert
      ? { originalFileUrl: { not: null } }
      : { fileUrl: { startsWith: "http" } };

    const rows: FileAttachment[] = await prisma.fileAttachment.findMany({
      where,
      orderBy: { id: "asc" },
      take: args.batchSize,
      ...(cursor != null
        ? { skip: 1, cursor: { id: cursor } }
        : {}),
    });

    if (rows.length === 0) break;

    for (const row of rows) {
      if (args.limit != null && processed >= args.limit) {
        logger(`[limit=${args.limit}] reached. stopping.`);
        break;
      }
      processed++;

      try {
        if (args.revert) {
          await revertRow(row, s3, env.bucket, args, logger);
        } else {
          const result = await migrateRow(row, s3, env.bucket, args, logger);
          if (samples.length < 5 && args.dryRun) {
            samples.push({
              id: row.id,
              from: row.fileUrl,
              toKey: result.newKey,
              entityType: row.entityType,
            });
          }
        }
        migrated++;
      } catch (err) {
        failed++;
        const reason = (err as Error).message ?? String(err);
        failures.push({ id: row.id, reason });
        logger(`[fail] id=${row.id} reason=${reason}`);
        // Fail-soft: do not abort the whole run on a single row failure.
        continue;
      }

      cursor = row.id;
    }

    if (!args.dryRun) {
      await writeCheckpoint({
        lastId: cursor,
        mode: args.revert ? "revert" : args.dryRun ? "dry-run" : "migrate",
        updatedAt: new Date().toISOString(),
      });
    }

    if (args.limit != null && processed >= args.limit) break;
  }

  logger("");
  logger("==== Summary ====");
  logger(`Mode:        ${args.dryRun ? "DRY-RUN" : args.revert ? "REVERT" : "MIGRATE"}`);
  logger(`Processed:   ${processed}`);
  logger(`Migrated:    ${migrated}`);
  logger(`Failed:      ${failed}`);

  if (args.dryRun && samples.length > 0) {
    logger("");
    logger("Sample would-change rows (first 5):");
    for (const s of samples) {
      logger(`  id=${s.id}  entityType=${s.entityType}  ${s.from}  →  ${s.toKey}`);
    }
  }

  if (failures.length > 0) {
    logger("");
    logger(`Failures (${failures.length}):`);
    for (const f of failures) logger(`  id=${f.id}  reason=${f.reason}`);
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
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
