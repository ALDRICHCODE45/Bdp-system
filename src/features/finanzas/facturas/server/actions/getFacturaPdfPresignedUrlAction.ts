"use server";

import { auth } from "@/core/lib/auth/auth";
import { PermissionError } from "@/core/shared/errors/domain";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { isCapturadorOnly } from "@/features/finanzas/facturas/helpers/capturadorUtils";

import prisma from "@/core/lib/prisma";
import { makeFacturaService } from "../services/makeFacturaService";
import { DigitalOceanSpacesService } from "@/features/Files/server/services/DigitalOceanSpacesService";

/**
 * secure-file-access — fix: RBAC-gated presigned URL for the Factura SAT PDF.
 *
 * The `Factura.facturaUrl` column was migrated by `1bf2216` to store the
 * raw Spaces object key (post-Phase-2 storage contract) instead of a public
 * URL. The column is owned by the `Factura` row itself — it does NOT go
 * through the `FileAttachment` system, so the existing
 * `getFilePresignedUrlAction(fileId)` (which requires a `FileAttachment.id`)
 * cannot serve it. Two UI consumers used to render the raw value as an
 * `<a href>`, which 401s against the bucket host once the value is a key.
 *
 * This action closes that gap: it accepts the Factura's own `id`, loads the
 * row, gates the request through the same fail-closed order as
 * `getFilePresignedUrlAction` (auth → load → module perm → capturador
 * ownership → mint), and mints a short-lived (600 s = 10 min) presigned
 * GET URL. Legacy rows whose `facturaUrl` is still a full http URL are
 * served as-is so the backfill hasn't run yet.
 *
 * Fail-closed ordering (mirrors `getFilePresignedUrlAction.ts:65-151`):
 *
 *   1. `auth()` — null session ⇒ `PermissionError`, NO DB side effects.
 *      Explicit pre-DB guard; `requireAnyPermission` internally calls
 *      `auth()` again but we want a guaranteed pre-DB gate so an
 *      unauthenticated request never loads the Factura row.
 *
 *   2. `facturaService.getById(facturaId)` — loads the Factura. We need
 *      both `facturaUrl` (the key/URL to serve) and `ingresadoPor` (for
 *      the capturador ownership check below). Note: this is a single
 *      read — we do NOT call `getFacturaByIdAction` because that action
 *      already applies the capturador filter on its own return; we want
 *      to keep the filter at step 5 here so the error path is identical
 *      to `getFilePresignedUrlAction` (do not leak existence).
 *
 *   3. Missing `facturaUrl` ⇒ `{ ok: false, error }`. No point continuing
 *      to the permission check if there is nothing to serve. Short-circuit
 *      here so we never reach the capturador anti-IDOR check or the
 *      signer for a row that has no PDF attached — a capturador probing
 *      a Factura id without a PDF would otherwise see a misleading
 *      `PermissionError` ("No tenés permiso") instead of the real reason.
 *
 *   4. `requireAnyPermission(['facturas:acceder'])` — module-level RBAC.
 *      `permission-checker.hasPermission` honours `admin:all` and
 *      `facturas:gestionar` automatically, so admins and module-wide
 *      users pass through without a separate check.
 *
 *   5. Capturador anti-IDOR ownership check. If the session is
 *      capturador-only (`facturas:capturar` without `facturas:crear`,
 *      `facturas:editar`, `facturas:gestionar`, or `admin:all`) then the
 *      Factura MUST have `ingresadoPor === session.user.id`. Mismatch
 *      throws `PermissionError("No tenés permiso para acceder a este
 *      archivo", "facturas:acceder:ownership")` — same error code as
 *      `getFilePresignedUrlAction` step 5 so the response shape stays
 *      consistent across both read paths and we do NOT leak whether the
 *      Factura exists.
 *
 *   6. Legacy-URL-vs-key branch:
 *        - If `facturaUrl.startsWith("http")` (legacy public URL, not yet
 *          backfilled to a key): return as-is. Public objects still work
 *          without a signature so the user can keep viewing them while
 *          the backfill is pending.
 *        - Otherwise: treat as raw object key and mint a presigned GET
 *          via `DigitalOceanSpacesService.getPresignedGetUrl(key, 600)`.
 *          TTL 600 s sits in the spec-banded 5–15 min window, matching
 *          `getFilePresignedUrlAction` step 6.
 *
 * @param facturaId - The `Factura.id` whose PDF should be served.
 * @returns On success: `{ ok: true, data: { url } }` where `url` is either
 *          the legacy public URL or a freshly minted presigned URL.
 *          On any guard failure: `{ ok: false, error }`. On uncaught
 *          PermissionError from steps 1/5: bubbles up (same convention
 *          as `getFilePresignedUrlAction` for the `auth:required` and
 *          `facturas:acceder:ownership` codes).
 */
export async function getFacturaPdfPresignedUrlAction(
  facturaId: string
): Promise<
  { ok: true; data: { url: string } } | { ok: false; error: string }
> {
  // ── 1. auth() — fail-closed BEFORE any DB call ────────────────────────
  // Explicit pre-DB guard so an unauthenticated request never loads the
  // Factura row. requireAnyPermission below also calls auth() — that is
  // intentional defense-in-depth (matches getFilePresignedUrlAction:74-79
  // and the project's existing guards).
  const session = await auth();
  if (!session?.user) {
    throw new PermissionError("No autenticado", "auth:required");
  }
  const userId = session.user.id;
  const userPermissions = session.user.permissions ?? [];

  // ── 2. Load the Factura by id ──────────────────────────────────────────
  // We read the entity directly (not via getFacturaByIdAction) because the
  // capturador filter must run AFTER the module-level check at step 4 so
  // the fail-closed order mirrors getFilePresignedUrlAction exactly.
  const facturaService = makeFacturaService({ prisma });
  const facturaResult = await facturaService.getById(facturaId);
  if (!facturaResult.ok) {
    return { ok: false, error: facturaResult.error.message };
  }
  const factura = facturaResult.value;
  if (!factura) {
    return { ok: false, error: "Factura no encontrada" };
  }

  // ── 3. No PDF on the Factura — short-circuit BEFORE the permission gate ─
  // Short-circuit here so a capturador probing random ids gets the real
  // reason ("no PDF") instead of a misleading `PermissionError`. The
  // permission gates at steps 4–5 still apply to actual "view PDF"
  // clicks; a row without a PDF just yields a 4xx-style error, never a
  // signature.
  if (!factura.facturaUrl) {
    return { ok: false, error: "Esta factura no tiene un PDF adjunto" };
  }

  // ── 4. Module-level RBAC (honours admin:all + facturas:gestionar) ─────
  // requireAnyPermission internally calls auth() again (defense-in-depth)
  // and throws PermissionError on deny. Admin / module-wide users bypass
  // the capturador ownership check at step 5 via isCapturadorOnly
  // returning false.
  await requireAnyPermission(["facturas:acceder"]);

  // ── 5. Capturador anti-IDOR ownership check ───────────────────────────
  // Mirror of getFilePresignedUrlAction.ts:114-135. FacturaEntity DOES
  // expose `ingresadoPor` (FacturaRepository.repository.ts:31), so we
  // compare it directly against the session id. `ingresadoPor` is
  // `string | null`; `userId` is `string` (narrowed by the null-session
  // check above). If the Factura has no `ingresadoPor`, treat as deny —
  // the capturador-only account can't claim a Factura that was never
  // attributed to anyone. The throw happens AFTER the read so we can
  // return the proper error code, but the response shape matches
  // getFilePresignedUrlAction so the client doesn't need to distinguish.
  if (isCapturadorOnly(userPermissions)) {
    if (factura.ingresadoPor === null || factura.ingresadoPor !== userId) {
      throw new PermissionError(
        "No tenés permiso para acceder a este archivo",
        "facturas:acceder:ownership"
      );
    }
  }

  // ── 6. Legacy-URL-vs-key branch + mint presigned GET ──────────────────
  // Legacy rows whose `facturaUrl` was never backfilled still hold a full
  // public URL. We serve them as-is (public objects don't need a
  // signature). New rows hold a raw Spaces key — mint a 600 s signed GET
  // URL through the shared DigitalOceanSpacesService primitive so the
  // signer config (endpoint, bucket, region, credentials) lives in one
  // place across both read paths.
  if (factura.facturaUrl.startsWith("http")) {
    return { ok: true, data: { url: factura.facturaUrl } };
  }

  try {
    const spacesService = new DigitalOceanSpacesService();
    const url = await spacesService.getPresignedGetUrl(factura.facturaUrl, 600);
    return { ok: true, data: { url } };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al generar la URL presignada",
    };
  }
}