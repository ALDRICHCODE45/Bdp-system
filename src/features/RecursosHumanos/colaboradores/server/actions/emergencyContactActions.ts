"use server";

import { z } from "zod";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { makeEmergencyContactService } from "../services/makeEmergencyContactService";
import { emergencyContactSchema } from "../validators/emergencyContactSchema";

/**
 * Server actions for the EmergencyContact feature.
 *
 * Conventions (CC1, CC8):
 * - Every mutating action calls `requireAnyPermission` with
 *   `colaboradores:editar` BEFORE the service. The same permission is later
 *   enforced in the UI via <PermissionGuard> (defense in depth).
 * - The Server Action is the ONLY place where input is coerced from
 *   FormData / unknown into typed shapes; the service receives a normal
 *   object.
 * - Errors from the service layer are caught and returned as
 *   `{ ok: false, error }` so the TanStack Query mutation can surface a
 *   toast without an unhandled throw.
 */

const idSchema = z.object({
  id: z.string().uuid("ID de contacto inválido"),
});

const createSchema = emergencyContactSchema.and(
  z.object({ colaboradorId: z.string().uuid("ID de colaborador inválido") })
);

/**
 * List all emergency contacts attached to a given colaborador.
 *
 * Read-only; gated by `colaboradores:acceder` (not `editar`). Anyone allowed
 * to view the profile can see the contacts, which matches the cap4 "list"
 * requirement (no delete / add needed).
 */
export async function listEmergencyContactsAction(colaboradorId: string) {
  // Read: only need to see the profile, not edit it.
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.acceder,
      PermissionActions.colaboradores.editar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para ver contactos de emergencia"
  );

  const parsedId = z.string().uuid("ID de colaborador inválido").safeParse(colaboradorId);
  if (!parsedId.success) {
    return { ok: false as const, error: parsedId.error.issues[0]?.message || "ID inválido" };
  }

  const service = makeEmergencyContactService({ prisma });
  const result = await service.listByColaborador(parsedId.data);
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }
  return { ok: true as const, data: result.value };
}

/**
 * Create a new emergency contact for the given colaborador.
 *
 * Mutating: gated by `colaboradores:editar` (CC1/CC8).
 */
export async function createEmergencyContactAction(input: FormData) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.editar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para agregar contactos de emergencia"
  );

  const raw = {
    colaboradorId: input.get("colaboradorId"),
    nombre: input.get("nombre"),
    parentesco: input.get("parentesco"),
    telefono: input.get("telefono"),
    email: input.get("email"),
    notas: input.get("notas"),
  };

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message || "Error de validación",
    };
  }

  // The schema transforms empty strings to null on email/notas. We just pass
  // through to the service so optional/nullable semantics stay consistent.
  const service = makeEmergencyContactService({ prisma });
  const result = await service.create({
    colaboradorId: parsed.data.colaboradorId,
    nombre: parsed.data.nombre,
    parentesco: parsed.data.parentesco,
    telefono: parsed.data.telefono,
    email: parsed.data.email ?? null,
    notas: parsed.data.notas ?? null,
  });

  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }
  return { ok: true as const, data: result.value };
}

/**
 * Delete an emergency contact by its primary key.
 *
 * Mutating: gated by `colaboradores:editar` (CC1/CC8). The UI shows a
 * confirmation dialog (AlertDialog) before calling this action; if dismissed,
 * no request is made and the row stays put (cap4 scenario).
 */
export async function deleteEmergencyContactAction(id: string) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.editar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para eliminar contactos de emergencia"
  );

  const parsed = idSchema.safeParse({ id });
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message || "ID inválido",
    };
  }

  const service = makeEmergencyContactService({ prisma });
  const result = await service.delete(parsed.data.id);
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }
  return { ok: true as const };
}
