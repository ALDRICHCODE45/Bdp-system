"use server";

import { z } from "zod";
import { NivelSeniority } from "@prisma/client";
import { revalidatePath } from "next/cache";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { makePositionHistoryService } from "../services/makePositionHistoryService";
import { positionHistorySchema } from "../validators/positionHistorySchema";

/**
 * Server action: register a new position adjustment (cap6 req5 + cap5 req6).
 *
 * Permission gating (CC1/CC8):
 * - `requireAnyPermission(['colaboradores:editar'])` runs FIRST.
 *
 * Transactional integrity (CC5 / cap6 req5):
 * - The service `adjustPosition` opens a single `prisma.$transaction` that
 *   updates `Colaborador.{puesto,departamento,nivel}` AND inserts a
 *   `ColaboradorPositionHistory` row capturing the PREVIOUS values. Any
 *   throw inside the tx rolls back BOTH writes — no partial state leaks.
 *
 * Coordination with P3:
 * - P3 added an auto-position-history write inside `ColaboradorService.update`
 *   (fires on `puesto/departamento/nivel` diff). This `adjustPosition` is
 *   the dedicated, user-facing path the Compensación tab calls. The two
 *   paths are independent — they DO NOT double-write for one logical
 *   change because the Compensación tab does not go through the
 *   EditColaboradorSheet's `updateColaboradorAction`.
 */

const idSchema = z.object({
  colaboradorId: z.string().uuid("ID de colaborador inválido"),
});

/**
 * Read-only list of position history. Gated by `colaboradores:acceder`.
 */
export async function listPositionHistoryAction(colaboradorId: string) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.acceder,
      PermissionActions.colaboradores.editar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para ver el historial de posición"
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

  const service = makePositionHistoryService({ prisma });
  const result = await service.listByColaborador(parsedId.data);
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }
  return { ok: true as const, data: result.value };
}

/**
 * Mutating: gate FIRST, validate, service.adjustPosition, revalidate.
 */
export async function adjustPositionAction(input: FormData) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.editar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para registrar ajustes de posición"
  );

  const raw = {
    colaboradorId: input.get("colaboradorId"),
    fechaEfectiva: input.get("fechaEfectiva"),
    cargo: input.get("cargo"),
    departamento: input.get("departamento"),
    nivel: input.get("nivel"),
    motivo: input.get("motivo"),
  };

  const parsedId = idSchema.safeParse({ colaboradorId: raw.colaboradorId });
  if (!parsedId.success) {
    return {
      ok: false as const,
      error: parsedId.error.issues[0]?.message || "ID inválido",
    };
  }

  const parsed = positionHistorySchema.safeParse({
    fechaEfectiva: raw.fechaEfectiva,
    cargo: raw.cargo,
    departamento: raw.departamento,
    nivel: raw.nivel,
    motivo: raw.motivo,
  });
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message || "Error de validación",
    };
  }

  // Zod already converts empty strings to null on optional fields. Re-narrow
  // the nivel to the Prisma enum for the service layer.
  const nivel = parsed.data.nivel
    ? (parsed.data.nivel as NivelSeniority)
    : null;

  const service = makePositionHistoryService({ prisma });
  const result = await service.adjustPosition({
    colaboradorId: parsedId.data.colaboradorId,
    fechaEfectiva: new Date(parsed.data.fechaEfectiva),
    cargo: parsed.data.cargo,
    departamento: parsed.data.departamento ?? null,
    nivel,
    motivo: parsed.data.motivo ?? null,
  });
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }

  // Bust the profile + Laboral + Compensación routes.
  revalidatePath(`/colaboradores/${parsedId.data.colaboradorId}`);

  return { ok: true as const, data: result.value };
}