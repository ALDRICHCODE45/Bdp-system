"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { makeSalaryHistoryService } from "../services/makeSalaryHistoryService";
import { salaryHistorySchema } from "../validators/salaryHistorySchema";

/**
 * Server action: register a new salary adjustment (cap6 req4).
 *
 * Permission gating (CC1/CC8):
 * - `requireAnyPermission(['colaboradores:editar'])` runs FIRST so a
 *   revoker never reaches the service layer. The UI also wraps the trigger
 *   in a `<PermissionGuard>` so unauthorized users never see the button.
 *
 * Transactional integrity (CC5 / cap6 req4):
 * - The service `adjustSalary` opens a single `prisma.$transaction` that
 *   updates `Colaborador.sueldo` AND inserts a `ColaboradorSalaryHistory`
 *   row. Any throw inside the tx rolls back BOTH writes — neither the live
 *   `sueldo` nor an orphaned history row leaks out as a partial state.
 *
 * Side-effects after commit:
 * - `revalidatePath` busts the perfil route so the next navigation sees the
 *   updated live sueldo AND the freshly-appended history row.
 */

const idSchema = z.object({
  colaboradorId: z.string().uuid("ID de colaborador inválido"),
});

/**
 * Read-only list of salary history for one colaborador. Gated by
 * `colaboradores:acceder` (any profile viewer can read the audit trail).
 */
export async function listSalaryHistoryAction(colaboradorId: string) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.acceder,
      PermissionActions.colaboradores.editar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para ver el historial de sueldo"
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

  const service = makeSalaryHistoryService({ prisma });
  const result = await service.listByColaborador(parsedId.data);
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }
  return { ok: true as const, data: result.value };
}

/**
 * Mutating: gate FIRST, validate, service.adjustSalary, revalidate.
 */
export async function adjustSalaryAction(input: FormData) {
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.editar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para registrar ajustes de sueldo"
  );

  const raw = {
    colaboradorId: input.get("colaboradorId"),
    fechaEfectiva: input.get("fechaEfectiva"),
    monto: input.get("monto"),
    motivo: input.get("motivo"),
  };

  const parsedId = idSchema.safeParse({ colaboradorId: raw.colaboradorId });
  if (!parsedId.success) {
    return {
      ok: false as const,
      error: parsedId.error.issues[0]?.message || "ID inválido",
    };
  }

  const parsed = salaryHistorySchema.safeParse({
    fechaEfectiva: raw.fechaEfectiva,
    monto: raw.monto,
    motivo: raw.motivo,
  });
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message || "Error de validación",
    };
  }

  const service = makeSalaryHistoryService({ prisma });
  const result = await service.adjustSalary({
    colaboradorId: parsedId.data.colaboradorId,
    fechaEfectiva: new Date(parsed.data.fechaEfectiva),
    monto: Number(parsed.data.monto),
    motivo: parsed.data.motivo ?? null,
  });
  if (!result.ok) {
    return { ok: false as const, error: result.error.message };
  }

  // Bust the profile route so a navigation back to the Resumen tab picks up
  // the freshly-updated `sueldo` immediately.
  revalidatePath(`/colaboradores/${parsedId.data.colaboradorId}`);

  return { ok: true as const, data: result.value };
}