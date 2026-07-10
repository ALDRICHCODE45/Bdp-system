"use server";

import { auth } from "@/core/lib/auth/auth";
import { PermissionError } from "@/core/shared/errors/domain";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { isCapturadorOnly } from "@/features/finanzas/facturas/helpers/capturadorUtils";

import prisma from "@/core/lib/prisma";
import { makeFileService } from "../services/makeFileService";
import { makeFacturaService } from "@/features/finanzas/facturas/server/services/makeFacturaService";
import { DigitalOceanSpacesService } from "../services/DigitalOceanSpacesService";

/**
 * secure-file-access — Phase 3: presigned READ action.
 *
 * Mints a short-lived (600 s = 10 min) presigned GET URL for an existing
 * `FileAttachment` row. The storage primitives (private ACL + key-only
 * `fileUrl`) were established in Phase 2; this action adds the
 * authorization layer that gates who can mint a signed URL.
 *
 * Fail-closed ordering (each step throws or returns BEFORE the next runs):
 *
 *   1. `auth()` — null session ⇒ `PermissionError`, NO DB side effects.
 *      This is the explicit pre-DB guard; even though `requireAnyPermission`
 *      internally calls `auth()` again, this first check guarantees we
 *      don't touch the database for an unauthenticated request (matches
 *      the spec "Null session fails closed" scenario).
 *
 *   2. `fileService.getById(fileId)` — loads the owning row to derive
 *      `entityType` + `entityId` (the stored `fileUrl` is the raw object
 *      key, per the Phase 2 storage contract).
 *
 *   3. `entityType` → module permission map (FACTURA → `facturas:acceder`,
 *      MOVIMIENTO → `movimientos:acceder`, CLIENTE_PROVEEDOR →
 *      `clientes-proovedores:acceder`, COLABORADOR →
 *      `colaboradores:acceder`). All four strings are verified to exist
 *      in `permissions.constant.ts`. The misspelling
 *      `clientes-proovedores:acceder` is intentional — match it exactly.
 *
 *   4. `requireAnyPermission([modulePerm])` — throws `PermissionError` on
 *      deny. `permission-checker.hasPermission` already honours
 *      `admin:all` and any `<resource>:gestionar` (covers the spec
 *      "Admin or module-gestionar override" scenario).
 *
 *   5. Object-level ownership for FACTURA + capturador-only sessions.
 *      `FileEntity` has NO `ingresadoPor` field (File.entity.ts), so we
 *      MUST fetch the owning Factura via `makeFacturaService({ prisma
 *      }).getById(file.entityId)` and require `factura.ingresadoPor ===
 *      session.user.id`. This mirrors `getFacturaByIdAction.ts:21-24`
 *      exactly. Module-wide roles (`:gestionar`, `admin:all`) bypass
 *      the check because `isCapturadorOnly` returns false for them
 *      (spec "Module-wide role bypasses ownership check").
 *      Throws `PermissionError` on mismatch — prevents a capturador
 *      from presigning another capturador's invoice file (IDOR).
 *
 *   6. `DigitalOceanSpacesService.getPresignedGetUrl(file.fileUrl, 600)`.
 *      TTL 600 s sits in the spec-banded 5–15 min window. `file.fileUrl`
 *      is the raw object key, e.g. `"facturas/1715…-uuid.pdf"`.
 *
 * @param fileId - The `FileAttachment.id` to mint a signed GET for.
 * @returns On success: `{ ok: true, data: { url } }` where `url` is the
 *          presigned GET URL. On any guard failure: `{ ok: false, error }`.
 */
export async function getFilePresignedUrlAction(
  fileId: string
): Promise<
  { ok: true; data: { url: string } } | { ok: false; error: string }
> {
  // ── 1. auth() — fail-closed BEFORE any DB call ────────────────────────
  // Explicit pre-DB guard so an unauthenticated request never touches
  // the database. requireAnyPermission below also calls auth() — that's
  // intentional defense-in-depth (matches the project's existing guards).
  const session = await auth();
  if (!session?.user) {
    throw new PermissionError("No autenticado", "auth:required");
  }
  const userId = session.user.id;
  const userPermissions = session.user.permissions ?? [];

  // ── 2. Load the owning row to derive entityType + entityId ────────────
  const fileService = makeFileService({ prisma });
  const fileResult = await fileService.getById(fileId);
  if (!fileResult.ok) {
    return { ok: false, error: fileResult.error.message };
  }
  const file = fileResult.value;
  if (!file) {
    return { ok: false, error: "Archivo no encontrado" };
  }

  // ── 3. entityType → required module permission ────────────────────────
  const modulePerm = entityTypeToAccessPermission(file.entityType);
  if (!modulePerm) {
    return { ok: false, error: "Tipo de entidad no soportado" };
  }

  // ── 4. Module-level RBAC (honours admin:all + :gestionar) ─────────────
  // requireAnyPermission internally calls auth() again (defense-in-depth)
  // and throws PermissionError on deny. Admin / module-wide users bypass
  // ownership check at step 5 via isCapturadorOnly returning false.
  await requireAnyPermission([modulePerm]);

  // ── 5. Object-level ownership for FACTURA + capturador-only ────────────
  // Mirror of getFacturaByIdAction.ts:21-24. FileEntity has NO
  // `ingresadoPor` field (File.entity.ts:10-23), so we MUST fetch the
  // owning Factura. Only applied to capturador-only sessions; users with
  // module-wide perms (`facturas:gestionar` / `admin:all`) already cleared
  // the wider check at step 4 and isCapturadorOnly returns false for them.
  if (file.entityType === "FACTURA" && isCapturadorOnly(userPermissions)) {
    const facturaService = makeFacturaService({ prisma });
    const facturaResult = await facturaService.getById(file.entityId);
    if (!facturaResult.ok) {
      // Treat as deny — do NOT leak whether the Factura exists or not.
      throw new PermissionError(
        "No tenés permiso para acceder a este archivo",
        "facturas:acceder:ownership"
      );
    }
    const factura = facturaResult.value;
    // `ingresadoPor` is `string | null`; `userId` is `string` (narrowed by
    // the null-session check above). If the Factura has no `ingresadoPor`,
    // treat as deny — the capturador-only account can't claim a Factura
    // that was never attributed to anyone.
    if (factura.ingresadoPor === null || factura.ingresadoPor !== userId) {
      throw new PermissionError(
        "No tenés permiso para acceder a este archivo",
        "facturas:acceder:ownership"
      );
    }
  }

  // ── 6. Mint the presigned GET URL (600 s, inside the 5–15 min band) ───
  try {
    const spacesService = new DigitalOceanSpacesService();
    const url = await spacesService.getPresignedGetUrl(file.fileUrl, 600);
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

/**
 * Map `FileAttachment.entityType` to the module-level access permission
 * required to read the file. Returns `null` for unknown entity types
 * (the caller treats that as deny).
 *
 * Verbatim copy of the module→permission table in
 * `openspec/changes/secure-file-access/design.md`. The misspelling
 * `clientes-proovedores:acceder` is intentional — it matches the real
 * constant in `permissions.constant.ts:99`.
 */
function entityTypeToAccessPermission(
  entityType: "FACTURA" | "MOVIMIENTO" | "CLIENTE_PROVEEDOR" | "COLABORADOR"
): string | null {
  switch (entityType) {
    case "FACTURA":
      return "facturas:acceder";
    case "MOVIMIENTO":
      return "movimientos:acceder";
    case "CLIENTE_PROVEEDOR":
      return "clientes-proovedores:acceder";
    case "COLABORADOR":
      return "colaboradores:acceder";
    default:
      return null;
  }
}
