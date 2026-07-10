"use server";

import { auth } from "@/core/lib/auth/auth";
import { PermissionError } from "@/core/shared/errors/domain";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { makeFileService } from "../services/makeFileService";
import prisma from "@/core/lib/prisma";
import {
  entityTypeToAccessPermission,
  type FileEntityType,
} from "../helpers/fileEntityPermissions";

/**
 * P5 — widened to include COLABORADOR (cap12 req1). The returned
 * `FileEntity` shape now carries `expiryDate` + `category` (nullable for
 * the existing entityTypes) — see File.entity.ts.
 *
 * secure-file-access — Phase 4: fail-closed RBAC + no-DB-on-null-session.
 *
 * Spec scenario "Unauthenticated list rejected" requires NO Prisma query
 * when the session is null. The pre-Phase-4 implementation called
 * `makeFileService({ prisma })` and `fileService.getFilesByEntity(...)`
 * synchronously — an anonymous request would still issue a database read.
 *
 * Fail-closed ordering:
 *   1. `auth()` — null session ⇒ `PermissionError`, no prisma instance is
 *      even constructed.
 *   2. `entityType` → permission map (`:acceder` map). Same source-of-truth
 *      as the presign action — both list and read resolve permissions from
 *      one switch.
 *   3. `requireAnyPermission([accessPerm])` — throws `PermissionError` if
 *      the user lacks the module-level access permission. Admin:all and
 *      `<resource>:gestionar` are honored automatically.
 *   4. Existing list flow runs.
 */
export const getFilesByEntityAction = async (
  entityType: FileEntityType,
  entityId: string
) => {
  if (!entityType || !entityId) {
    return { ok: false, error: "Se requiere entityType y entityId" };
  }

  // ── 1. auth() — fail-closed BEFORE any Prisma call ─────────────────────
  // Matches spec:77 wording — "the response is PermissionError and no
  // Prisma query is executed". We throw before constructing `fileService`
  // so a null session never produces a DB read.
  const session = await auth();
  if (!session?.user) {
    throw new PermissionError("No autenticado", "auth:required");
  }

  // ── 2. entityType → required module `:acceder` permission ─────────────
  const accessPerm = entityTypeToAccessPermission(entityType);
  if (!accessPerm) {
    return { ok: false, error: "Tipo de entidad no soportado" };
  }

  // ── 3. Module-level RBAC ───────────────────────────────────────────────
  await requireAnyPermission(
    [accessPerm],
    `No tienes permiso para listar archivos de ${entityType}`
  );

  const fileService = makeFileService({ prisma });
  const result = await fileService.getFilesByEntity(entityType, entityId);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  return { ok: true, data: result.value };
};
