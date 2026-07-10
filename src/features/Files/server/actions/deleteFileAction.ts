"use server";

import { auth } from "@/core/lib/auth/auth";
import { PermissionError } from "@/core/shared/errors/domain";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { makeFileService } from "../services/makeFileService";
import prisma from "@/core/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  entityTypeToDeletePermission,
} from "../helpers/fileEntityPermissions";

/**
 * P5 — widened to include COLABORADOR (cap12 req1) AND the COLABORADOR
 * pathMap entry. Without this entry the delete path would silently bypass
 * `revalidatePath` for COLABORADOR files and the profile tab would show
 * stale data after a remove.
 *
 * secure-file-access — Phase 4 (SUGGESTION-1): entityType is derived from
 * the persisted row, NOT from FormData.
 *
 * Pre-Phase-4 risk: the action read `entityType` straight from FormData,
 * which is client-controlled. An attacker could pass `entityType=...`
 * for a module they held `:eliminar` on, then target a `fileId` belonging
 * to a different entityType — the action would happily delete it. We now
 * load the row first, take `entityType` from the persisted entity, and
 * resolve the required permission against THAT. The FormData-supplied
 * `entityType` from the client is IGNORED entirely (the post-delete
 * `revalidatePath` uses the row's entityType as well so all paths are
 * server-derived, never client-derived).
 *
 * Fail-closed ordering:
 *   1. `auth()` — null session ⇒ `PermissionError`, NO DB or Spaces call.
 *   2. Read `fileId` from FormData (the only input the action trusts).
 *   3. `fileService.getById(fileId)` — load the persisted row. Missing row
 *      ⇒ short-circuit with `"Archivo no encontrado"` (no permission check
 *      is meaningful, and no side effects should run).
 *   4. `entityType` (from row) → `:eliminar` permission map.
 *   5. `requireAnyPermission([deletePerm])` — throws on deny.
 *   6. Existing delete flow runs (Spaces delete + Prisma delete +
 *      revalidate against the row's entityType).
 *
 * Cost: one extra SELECT against `FileAttachment`. Acceptable — the row
 * is already being read by `FileService.deleteFile` (FileService.ts:84)
 * which calls `findById` again. A future optimization could pass the
 * already-loaded `fileEntity` into the service and skip the second read,
 * but that's out of scope for Phase 4.
 */
export const deleteFileAction = async (formData: FormData) => {
  // ── 1. auth() — fail-closed BEFORE any DB or Spaces call ───────────────
  const session = await auth();
  if (!session?.user) {
    throw new PermissionError("No autenticado", "auth:required");
  }

  const fileId = formData.get("fileId") as string;

  if (!fileId) {
    return { ok: false, error: "Se requiere el ID del archivo" };
  }

  const fileService = makeFileService({ prisma });

  // ── 2. Load the persisted row to DERIVE entityType (SUGGESTION-1) ──────
  // The client-supplied `entityType` field is intentionally NOT read here;
  // every guard in this action resolves permissions from the persisted row.
  const lookup = await fileService.getById(fileId);
  if (!lookup.ok) {
    return { ok: false, error: lookup.error.message };
  }
  const file = lookup.value;
  if (!file) {
    return { ok: false, error: "Archivo no encontrado" };
  }

  // ── 3. Resolve required `:eliminar` permission from the row's type ────
  const deletePerm = entityTypeToDeletePermission(file.entityType);
  if (!deletePerm) {
    return { ok: false, error: "Tipo de entidad no soportado" };
  }

  // ── 4. Module-level RBAC ───────────────────────────────────────────────
  await requireAnyPermission(
    [deletePerm],
    `No tienes permiso para eliminar archivos de ${file.entityType}`
  );

  // ── 5. Existing delete flow ────────────────────────────────────────────
  const result = await fileService.deleteFile(fileId);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  // ── 6. Revalidate using the AUTHORITATIVE entityType from the row ──────
  const pathMap: Record<string, string> = {
    FACTURA: "/facturas",
    MOVIMIENTO: "/movimientos",
    CLIENTE_PROVEEDOR: "/clientes-proovedores",
    COLABORADOR: "/colaboradores",
  };

  const path = pathMap[file.entityType];
  if (path) {
    revalidatePath(path);
  }

  return { ok: true };
};
