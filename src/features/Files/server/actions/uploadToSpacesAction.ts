"use server";

import { auth } from "@/core/lib/auth/auth";
import { PermissionError } from "@/core/shared/errors/domain";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { DigitalOceanSpacesService } from "../services/DigitalOceanSpacesService";

/**
 * secure-file-access — Phase 4 (WARNING-2 pin): RBAC-guarded SAT-invoice
 * PDF upload.
 *
 * Sole caller is `FacturaSATUpload.tsx` (used inside `CreateFacturaForm` and
 * `EditFacturaForm`), which is gated upstream by `createFacturaAction` /
 * `updateFacturaAction`. Those actions require `[facturas:capturar,
 * facturas:crear, facturas:gestionar]` — so a "capturador" account that
 * creates invoices only has `facturas:capturar` (not `facturas:crear`,
 * `facturas:gestionar`, or `admin:all`).
 *
 * Permission choice: `[facturas:capturar, facturas:crear, facturas:gestionar]`.
 *  - It mirrors the createFacturaAction contract byte-for-byte, so any user
 *    who can currently upload a SAT PDF as part of invoice creation still
 *    can.
 *  - `facturas:acceder` is INTENTIONALLY excluded — read-only invoice viewers
 *    must not be able to push bytes into Spaces. Read access is enforced
 *    separately by `getFilePresignedUrlAction` for the *read* half.
 *  - `admin:all` and `facturas:gestionar` are honored automatically by
 *    `permission-checker.hasPermission` (it short-circuits on `admin:all`
 *    and folds in `<resource>:gestionar`), so we don't need to spell them out
 *    in the list — but matching the existing `createFacturaAction` convention
 *    keeps the permission surface self-documenting.
 *
 * Fail-closed ordering:
 *   1. `auth()` — null session ⇒ `PermissionError`, NO Spaces upload.
 *   2. `requireAnyPermission([capturar|crear|gestionar])` — throw on deny,
 *      still before any side effect.
 */
export const uploadToSpacesAction = async (
  formData: FormData
): Promise<{ ok: true; url: string } | { ok: false; error: string }> => {
  try {
    // ── 1. auth() — fail-closed BEFORE any storage call ──────────────────
    const session = await auth();
    if (!session?.user) {
      throw new PermissionError("No autenticado", "auth:required");
    }

    // ── 2. Module-level RBAC ─────────────────────────────────────────────
    await requireAnyPermission(
      [
        PermissionActions.facturas.capturar,
        PermissionActions.facturas.crear,
        PermissionActions.facturas.gestionar,
      ],
      "No tienes permiso para subir el PDF de la factura"
    );

    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "facturas";

    if (!file || file.size === 0) {
      return { ok: false, error: "No se proporcionó ningún archivo" };
    }

    const spacesService = new DigitalOceanSpacesService();
    const url = await spacesService.uploadFile(file, folder);

    return { ok: true, url };
  } catch (error) {
    if (error instanceof PermissionError) {
      return { ok: false, error: error.message };
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al subir el archivo",
    };
  }
};
