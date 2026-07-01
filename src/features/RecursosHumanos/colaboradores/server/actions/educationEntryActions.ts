"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { makeEducationEntryService } from "../services/makeEducationEntryService";
import {
  educationEntryReorderSchema,
  educationEntrySchema,
} from "../validators/educationEntrySchema";

/**
 * Server actions for the EducationEntry feature (cap10 req2 + req3).
 *
 * Conventions (CC1, CC8):
 * - Every mutating action calls `requireAnyPermission(['colaboradores:editar'])`
 *   BEFORE the service. The list action only needs `acceder` so any profile
 *   viewer can see the CV's education list.
 * - Errors are returned as `{ ok: false, error }` so the TanStack Query
 *   mutation can surface a toast without an unhandled throw.
 */

const idSchema = z.object({
  id: z.string().uuid("ID de entrada inválido"),
});

const createSchema = educationEntrySchema.and(
  z.object({ colaboradorId: z.string().uuid("ID de colaborador inválido") })
);

const updateSchema = idSchema.and(educationEntrySchema);

const reorderWithScopeSchema = educationEntryReorderSchema.and(
  z.object({ colaboradorId: z.string().uuid("ID de colaborador inválido") })
);

/**
 * Read-only list of education entries for one colaborador. Gated by
 * `colaboradores:acceder` (matches the cap10 requirement: anyone allowed
 * to view the profile can see the CV's education list).
 */
export async function listEducationEntriesAction(colaboradorId: string) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.acceder,
      PermissionActions.colaboradores.editar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para ver la formación académica"
  );

  const parsedId = z
    .string()
    .uuid("ID de colaborador inválido")
    .safeParse(colaboradorId);
  if (!parsedId.success) {
    return {
      ok: false as const,
      error: parsedId.error.issues[0]?.message || "ID inválido",
    };
  }

  const service = makeEducationEntryService({ prisma });
  const result = await service.listByColaborador(parsedId.data);
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }
  return { ok: true as const, data: result.value };
}

/**
 * Append a new education entry. Mutating: gated by `colaboradores:editar`.
 */
export async function createEducationEntryAction(input: FormData) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.editar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para agregar formación académica"
  );

  const parseOptionalInt = (val: FormDataEntryValue | null): number | undefined => {
    if (val === null || typeof val !== "string" || val.trim() === "") return undefined;
    const n = Number(val);
    return Number.isFinite(n) ? Math.trunc(n) : undefined;
  };

  const raw = {
    colaboradorId: input.get("colaboradorId"),
    institucion: input.get("institucion"),
    titulo: input.get("titulo"),
    anio: parseOptionalInt(input.get("anio")),
    orden: parseOptionalInt(input.get("orden")),
  };

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message || "Error de validación",
    };
  }

  const service = makeEducationEntryService({ prisma });
  const result = await service.create({
    colaboradorId: parsed.data.colaboradorId,
    institucion: parsed.data.institucion,
    titulo: parsed.data.titulo,
    anio: parsed.data.anio,
    orden: parsed.data.orden,
  });
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }

  // Bust the perfil route so the CV tab reflects the new entry immediately.
  revalidatePath(`/colaboradores/${parsed.data.colaboradorId}`);

  return { ok: true as const, data: result.value };
}

/**
 * Patch an existing education entry (institucion / titulo / anio / orden).
 * Mutating: gated by `colaboradores:editar`.
 */
export async function updateEducationEntryAction(input: FormData) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.editar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para editar formación académica"
  );

  const parseOptionalInt = (val: FormDataEntryValue | null): number | undefined => {
    if (val === null || typeof val !== "string" || val.trim() === "") return undefined;
    const n = Number(val);
    return Number.isFinite(n) ? Math.trunc(n) : undefined;
  };

  const raw = {
    id: input.get("id"),
    institucion: input.get("institucion"),
    titulo: input.get("titulo"),
    anio: parseOptionalInt(input.get("anio")),
    orden: parseOptionalInt(input.get("orden")),
  };

  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message || "Error de validación",
    };
  }

  const service = makeEducationEntryService({ prisma });
  const result = await service.update({
    id: parsed.data.id,
    institucion: parsed.data.institucion,
    titulo: parsed.data.titulo,
    anio: parsed.data.anio,
    orden: parsed.data.orden,
  });
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }

  return { ok: true as const, data: result.value };
}

/**
 * Remove an education entry. Mutating: gated by `colaboradores:editar`.
 */
export async function deleteEducationEntryAction(id: string) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.editar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para eliminar formación académica"
  );

  const parsed = idSchema.safeParse({ id });
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message || "ID inválido",
    };
  }

  const service = makeEducationEntryService({ prisma });
  const result = await service.delete(parsed.data.id);
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }
  return { ok: true as const };
}

/**
 * Bulk reorder the entries for one colaborador (cap10 req3). The repository
 * writes all updates inside a single `$transaction`. Mutating: gated by
 * `colaboradores:editar`.
 */
export async function reorderEducationEntriesAction(input: {
  colaboradorId: string;
  items: { id: string; orden: number }[];
}) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.editar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para reordenar la formación académica"
  );

  const parsed = reorderWithScopeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message || "Error de validación",
    };
  }

  const service = makeEducationEntryService({ prisma });
  const result = await service.reorder({
    colaboradorId: parsed.data.colaboradorId,
    items: parsed.data.items,
  });
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }
  return { ok: true as const };
}