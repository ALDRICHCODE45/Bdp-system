"use server";

import { z } from "zod";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { makeResponsabilidadCargoService } from "../services/makeResponsabilidadCargoService";
import { responsabilidadCargoSchema } from "../validators/responsabilidadCargoSchema";

/**
 * Server actions for the ResponsabilidadCargo feature (cap5).
 *
 * Every mutating action calls `requireAnyPermission(['colaboradores:editar'])`
 * BEFORE the service (CC1/CC8). The list action only needs `acceder` so
 * anyone allowed to view the profile can see the checklist; creating /
 * editing / toggling / removing is gated by `editar` (or `gestionar`).
 *
 * Errors are returned as `{ ok: false, error }` so the TanStack Query mutation
 * can surface a toast without an unhandled throw.
 */

const idSchema = z.object({
  id: z.string().uuid("ID de responsabilidad inválido"),
});

const createSchema = responsabilidadCargoSchema.and(
  z.object({ colaboradorId: z.string().uuid("ID de colaborador inválido") })
);

const updateSchema = idSchema.and(responsabilidadCargoSchema);

const toggleSchema = idSchema.and(
  z.object({ completada: z.boolean() })
);

/** List the checklist rows for a colaborador. Read-only. */
export async function listResponsabilidadesCargoAction(colaboradorId: string) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.acceder,
      PermissionActions.colaboradores.editar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para ver responsabilidades del cargo"
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

  const service = makeResponsabilidadCargoService({ prisma });
  const result = await service.listByColaborador(parsedId.data);
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }
  return { ok: true as const, data: result.value };
}

/** Add a new responsabilidad to the checklist. */
export async function createResponsabilidadCargoAction(input: FormData) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.editar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para crear responsabilidades del cargo"
  );

  const parseOptionalInt = (val: FormDataEntryValue | null): number | undefined => {
    if (val === null || typeof val !== "string" || val.trim() === "") return undefined;
    const n = Number(val);
    return Number.isFinite(n) ? Math.trunc(n) : undefined;
  };

  const parseOptionalBool = (val: FormDataEntryValue | null): boolean | undefined => {
    if (val === null || typeof val !== "string") return undefined;
    if (val === "true") return true;
    if (val === "false") return false;
    return undefined;
  };

  const raw = {
    colaboradorId: input.get("colaboradorId"),
    descripcion: input.get("descripcion"),
    orden: parseOptionalInt(input.get("orden")),
    completada: parseOptionalBool(input.get("completada")),
  };

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message || "Error de validación",
    };
  }

  const service = makeResponsabilidadCargoService({ prisma });
  const result = await service.create({
    colaboradorId: parsed.data.colaboradorId,
    descripcion: parsed.data.descripcion,
    orden: parsed.data.orden,
    completada: parsed.data.completada,
  });
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }
  return { ok: true as const, data: result.value };
}

/** Edit an existing responsabilidad (descripcion / orden / completada). */
export async function updateResponsabilidadCargoAction(input: FormData) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.editar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para editar responsabilidades del cargo"
  );

  const parseOptionalInt = (val: FormDataEntryValue | null): number | undefined => {
    if (val === null || typeof val !== "string" || val.trim() === "") return undefined;
    const n = Number(val);
    return Number.isFinite(n) ? Math.trunc(n) : undefined;
  };

  const parseOptionalBool = (val: FormDataEntryValue | null): boolean | undefined => {
    if (val === null || typeof val !== "string") return undefined;
    if (val === "true") return true;
    if (val === "false") return false;
    return undefined;
  };

  const raw = {
    id: input.get("id"),
    descripcion: input.get("descripcion"),
    orden: parseOptionalInt(input.get("orden")),
    completada: parseOptionalBool(input.get("completada")),
  };

  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message || "Error de validación",
    };
  }

  const service = makeResponsabilidadCargoService({ prisma });
  const result = await service.update({
    id: parsed.data.id,
    descripcion: parsed.data.descripcion,
    orden: parsed.data.orden,
    completada: parsed.data.completada,
  });
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }
  return { ok: true as const, data: result.value };
}

/**
 * Toggle the `completada` flag on a single responsabilidad.
 *
 * Kept as its own action (instead of overloading `update`) so the toggle
 * control never has to round-trip `descripcion` validation. The payload is
 * strict (`id` + `completada`) — anything malformed is rejected at the Zod
 * boundary before the service is touched.
 */
export async function toggleResponsabilidadCargoAction(input: {
  id: string;
  completada: boolean;
}) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.editar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para modificar responsabilidades del cargo"
  );

  const parsed = toggleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message || "Error de validación",
    };
  }

  const service = makeResponsabilidadCargoService({ prisma });
  const result = await service.toggleCompletada({
    id: parsed.data.id,
    completada: parsed.data.completada,
  });
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }
  return { ok: true as const, data: result.value };
}

/** Remove a responsabilidad from the checklist. */
export async function deleteResponsabilidadCargoAction(id: string) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.editar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para eliminar responsabilidades del cargo"
  );

  const parsed = idSchema.safeParse({ id });
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message || "ID inválido",
    };
  }

  const service = makeResponsabilidadCargoService({ prisma });
  const result = await service.delete(parsed.data.id);
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }
  return { ok: true as const };
}
