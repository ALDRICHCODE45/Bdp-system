"use server";

import { DocumentCategory } from "@prisma/client";
import { auth } from "@/core/lib/auth/auth";
import { PermissionError } from "@/core/shared/errors/domain";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { makeFileService } from "../services/makeFileService";
import prisma from "@/core/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  entityTypeToCreatePermission,
  type FileEntityType,
} from "../helpers/fileEntityPermissions";

/**
 * P5 — widened to include COLABORADOR (cap12 req1) + optional `expiryDate`
 * and `category` for the Documentos / CV uploads (cap8 + cap10). The path
 * map also picks up COLABORADOR so the perfil route gets busted on upload.
 *
 * secure-file-access — Phase 4: fail-closed RBAC. The pre-Phase-4 version
 * stamped `uploadedBy` from the session but did NOT actually enforce
 * authentication, so anyone able to reach the server function could
 * push bytes into Spaces + create a `FileAttachment` row.
 *
 * Fail-closed ordering:
 *   1. `auth()` — null session ⇒ `PermissionError`, NO DB or Spaces call.
 *      This is the explicit pre-DB guard.
 *   2. Validate the FormData fields (defense in depth — a malicious caller
 *      could pass garbage after auth()).
 *   3. `entityType` → permission map (`:crear` map from the shared helper).
 *      Unknown entityType ⇒ deny (caller treats `null` as forbidden).
 *   4. `requireAnyPermission([createPerm])` — throws `PermissionError` if
 *      the user lacks the module-level create permission. `admin:all` and
 *      `<resource>:gestionar` are honored automatically by
 *      `permission-checker.hasPermission`.
 *   5. Existing upload flow runs (Spaces upload → Prisma create).
 *
 * `entityType` is client-controlled via FormData. The downside (an attacker
 * could claim `entityType=CLIENTE_PROVEEDOR` to satisfy a permission they
 * hold) is acceptable here because:
 *   - The `:crear` granular perm is the same gate as for creating the
 *     underlying entity (FACTURA ⇒ `facturas:crear`, MOVIMIENTO ⇒
 *     `movimientos:crear`, etc.). A user with `clientes-proovedores:crear`
 *     SHOULD be able to upload files against a CLIENTE_PROVEEDOR — that's
 *     the documented contract.
 *   - Object-level scoping (WARNING-1 for the FACTURA+capturador pair) lives
 *     on the READ path (`getFilePresignedUrlAction`), not the create path.
 *     Creating an attachment that's then unverifiable for the creator
 *     itself is a degenerate but bounded state — the row sits in DB until
 *     a factura delete cascades it.
 */
export const uploadFileAction = async (formData: FormData) => {
  // ── 1. auth() — fail-closed BEFORE any DB or Spaces call ───────────────
  const session = await auth();
  if (!session?.user) {
    throw new PermissionError("No autenticado", "auth:required");
  }
  const uploadedBy = session.user.id;

  const file = formData.get("file") as File;
  const entityType = formData.get("entityType") as FileEntityType | null;
  const entityId = formData.get("entityId") as string;
  const expiryDateRaw = formData.get("expiryDate");
  const categoryRaw = formData.get("category");

  if (!file) {
    return { ok: false, error: "No se proporcionó ningún archivo" };
  }

  if (!entityType || !entityId) {
    return {
      ok: false,
      error: "Se requiere entityType y entityId",
    };
  }

  // ── 2. entityType → required module `:crear` permission ────────────────
  const createPerm = entityTypeToCreatePermission(entityType);
  if (!createPerm) {
    return { ok: false, error: "Tipo de entidad no soportado" };
  }

  // ── 3. Module-level RBAC ───────────────────────────────────────────────
  // Throws PermissionError on deny (admin:all + :gestionar are honored by
  // hasPermission internally). Defense-in-depth: requireAnyPermission also
  // calls auth() — that's fine, the explicit step 1 just guarantees the
  // database is never touched for an unauthenticated request.
  await requireAnyPermission(
    [createPerm],
    `No tienes permiso para subir archivos a ${entityType}`
  );

  // Normalize optional fields. Empty / missing values land as null so the
  // DTO surface stays "nullable → not persisted" for the existing entityTypes.
  const expiryDate =
    typeof expiryDateRaw === "string" && expiryDateRaw.trim() !== ""
      ? expiryDateRaw
      : null;
  const category =
    typeof categoryRaw === "string" &&
    categoryRaw.trim() !== "" &&
    isDocumentCategory(categoryRaw)
      ? categoryRaw
      : null;

  const fileService = makeFileService({ prisma });
  const result = await fileService.uploadFile(
    file,
    entityType,
    entityId,
    uploadedBy,
    { expiryDate, category }
  );

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  // Revalidar la ruta correspondiente según el tipo de entidad.
  // COLABORADOR busts the per-colaborador profile route so the Documentos
  // and CV tabs reflect the new file immediately on the next render.
  const pathMap: Record<string, string> = {
    FACTURA: "/facturas",
    MOVIMIENTO: "/movimientos",
    CLIENTE_PROVEEDOR: "/clientes-proovedores",
    COLABORADOR: "/colaboradores",
  };

  const path = pathMap[entityType];
  if (path) {
    revalidatePath(path);
  }

  return { ok: true, data: result.value };
};

/**
 * Narrow a raw string from FormData to a `DocumentCategory` enum value.
 * Anything unknown (including null / empty) returns false so the action
 * can safely coerce to `null` on the DTO.
 */
function isDocumentCategory(value: string): value is DocumentCategory {
  return (
    value === "CONTRATO" ||
    value === "INE" ||
    value === "RFC" ||
    value === "COMPROBANTE_DOMICILIO" ||
    value === "OTRO"
  );
}
