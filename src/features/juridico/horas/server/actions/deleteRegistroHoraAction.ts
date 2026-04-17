"use server";
import { revalidatePath } from "next/cache";
import { makeRegistroHoraService } from "../services/makeRegistroHoraService";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const deleteRegistroHoraAction = async (id: string) => {
  await requireAnyPermission(
    [PermissionActions["juridico-horas"].gestionar],
    "No tienes permiso para eliminar registros de horas"
  );

  const service = makeRegistroHoraService({ prisma });
  const result = await service.delete(id);

  if (!result.ok) return { ok: false as const, error: result.error.message };

  revalidatePath("/juridico/horas");
  return { ok: true as const };
};
