"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/core/lib/auth/auth";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { makeAbsenceRecordService } from "../services/makeAbsenceRecordService";
import { absenceRecordSchema } from "../validators/absenceRecordSchema";

/**
 * Server actions for the AbsenceRecord feature (cap9 req3 + cap13).
 *
 * Permission gating (CC1, CC8):
 * - `listAbsenceRecordsAction` only requires `colaboradores:acceder` (any
 *   profile viewer can read the registry — cap9 req4 + cap13 req3).
 * - `createAbsenceAction` is gated by the NEW `colaboradores:gestionar-ausencias`
 *   permission BEFORE the service runs. This is the defense-in-depth path:
 *   the UI also wraps the trigger in `<PermissionGuard>` so unauthorized
 *   users never see the button, but the server still rejects even if a
 *   tampered client calls it (cap13 req5 scenario).
 *
 * The `registradoPorId` field is sourced from the session — the action
 * reads `auth()` and forwards `session.user.id` to the service. This
 * guarantees the audit trail cannot be forged from a tampered FormData.
 */

const idSchema = z.object({
  id: z.string().uuid("ID de colaborador inválido"),
});

/**
 * Read-only list of absence records for one colaborador. Gated by
 * `colaboradores:acceder` (matches the spec: any profile viewer can see
 * the registry).
 */
export async function listAbsenceRecordsAction(colaboradorId: string) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.acceder,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para ver las ausencias"
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

  const service = makeAbsenceRecordService({ prisma });
  const result = await service.listByColaborador(parsedId.data);
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }
  return { ok: true as const, data: result.value };
}

/**
 * Register a new absence. Mutating: gated by `colaboradores:gestionar-ausencias`
 * FIRST (CC1/CC8). The action also reads `session.user.id` to populate the
 * `registradoPorId` audit field — clients cannot impersonate a different
 * registrant.
 */
export async function createAbsenceAction(input: FormData) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores["gestionar-ausencias"],
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para registrar ausencias"
  );

  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false as const,
      error: "No autenticado",
    };
  }

  const raw = {
    colaboradorId: input.get("colaboradorId"),
    tipo: input.get("tipo"),
    fechaInicio: input.get("fechaInicio"),
    fechaFin: input.get("fechaFin"),
    motivo: input.get("motivo"),
  };

  const parsedId = z
    .string()
    .uuid("ID de colaborador inválido")
    .safeParse(raw.colaboradorId);
  if (!parsedId.success) {
    return {
      ok: false as const,
      error: parsedId.error.issues[0]?.message || "ID inválido",
    };
  }

  const parsed = absenceRecordSchema.safeParse({
    tipo: raw.tipo,
    fechaInicio: raw.fechaInicio,
    fechaFin: raw.fechaFin,
    dias: Number(input.get("dias") ?? 0),
    motivo: typeof raw.motivo === "string" ? raw.motivo : undefined,
  });
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message || "Error de validación",
    };
  }

  const service = makeAbsenceRecordService({ prisma });
  const result = await service.create({
    colaboradorId: parsedId.data,
    tipo: parsed.data.tipo,
    fechaInicio: new Date(parsed.data.fechaInicio),
    fechaFin: new Date(parsed.data.fechaFin),
    motivo: parsed.data.motivo ?? null,
    registradoPorId: session.user.id,
  });
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }

  // Bust the perfil route so the Ausencias tab and the Resumen Vacaciones
  // KPI both reflect the new absence on the next render.
  revalidatePath(`/colaboradores/${parsedId.data}`);

  return { ok: true as const, data: result.value };
}

/**
 * Re-export for consumers that want to verify the id shape before calling
 * the action (kept module-private via the schema variable above).
 */
export { idSchema };