"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { makeVacationBalanceService } from "../services/makeVacationBalanceService";

/**
 * Server actions for the VacationBalance feature (cap9 req1 + cap13).
 *
 * Permission gating (CC1, CC8):
 * - `getVacationBalanceAction` only requires `colaboradores:acceder` (any
 *   profile viewer can read the donut's underlying data).
 * - `setVacationBalanceAction` is gated by the NEW
 *   `colaboradores:gestionar-ausencias` permission BEFORE the service runs.
 *   Admins (`gestionar`) are also allowed via the same `requireAnyPermission`
 *   call. The UI also wraps the trigger in `<PermissionGuard>` for
 *   defense-in-depth (cap13 req5).
 *
 * `setVacationBalanceAction` writes via `prisma.upsert` (atomic ON CONFLICT
 * semantics) so a 1:1 race never produces a duplicate row. On the rare
 * case where a Prisma P2002 escapes the atomic path, the service surfaces
 * a typed `ConflictError` instead of throwing — the action surfaces the
 * `result.error.message` as a structured `{ ok: false, error }` payload.
 */

const idSchema = z.object({
  colaboradorId: z.string().uuid("ID de colaborador inválido"),
});

/**
 * Read-only fetch of the vacation balance for one colaborador. Returns
 * `null` when no balance has been registered yet — the donut's empty
 * state relies on this signal (cap9 req5: NEVER fabricate a "0/0" total).
 */
export async function getVacationBalanceAction(colaboradorId: string) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.acceder,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para ver el balance de vacaciones"
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

  const service = makeVacationBalanceService({ prisma });
  const result = await service.getByColaborador(parsedId.data);
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }
  return { ok: true as const, data: result.value };
}

/**
 * Manually set the vacation balance (diasDisponibles + diasTomados).
 * Mutating: gated by `colaboradores:gestionar-ausencias` FIRST (CC1/CC8).
 */
export async function setVacationBalanceAction(input: FormData) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores["gestionar-ausencias"],
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para registrar el balance de vacaciones"
  );

  const raw = {
    colaboradorId: input.get("colaboradorId"),
    diasDisponibles: input.get("diasDisponibles"),
  };

  const parsedId = idSchema.safeParse({ colaboradorId: raw.colaboradorId });
  if (!parsedId.success) {
    return {
      ok: false as const,
      error: parsedId.error.issues[0]?.message || "ID inválido",
    };
  }

  const parseNonNegativeInt = (
    val: FormDataEntryValue | null
  ): number | undefined => {
    if (val === null || typeof val !== "string" || val.trim() === "") {
      return undefined;
    }
    const n = Number(val);
    return Number.isFinite(n) ? Math.trunc(n) : undefined;
  };

  // Only the annual quota (`diasDisponibles`) is entered by hand now.
  // `diasTomados` is derived server-side from the absence registry, so we
  // no longer read it from the form.
  const parsedDisponibles = parseNonNegativeInt(raw.diasDisponibles);
  if (parsedDisponibles === undefined || parsedDisponibles < 0) {
    return {
      ok: false as const,
      error: "El cupo de vacaciones debe ser un número entero no negativo",
    };
  }

  const service = makeVacationBalanceService({ prisma });
  const result = await service.set({
    colaboradorId: parsedId.data.colaboradorId,
    diasDisponibles: parsedDisponibles,
  });
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }

  // Bust the perfil route so the Ausencias donut AND the Resumen Vacaciones
  // KPI both reflect the freshly-stored balance on the next render.
  revalidatePath(`/colaboradores/${parsedId.data.colaboradorId}`);

  return { ok: true as const, data: result.value };
}