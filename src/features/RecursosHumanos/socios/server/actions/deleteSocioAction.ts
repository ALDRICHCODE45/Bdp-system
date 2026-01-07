"use server";
import { revalidatePath } from "next/cache";
import { makeSocioService } from "../services/makeSocioService";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const deleteSocioAction = async (id: string) => {
  // Verificar permiso antes de continuar
  await requireAnyPermission(
    [
      PermissionActions.socios.eliminar,
      PermissionActions.socios.gestionar,
    ],
    "No tienes permiso para eliminar socios"
  );
  const socioService = makeSocioService({ prisma });
  const result = await socioService.delete(id);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  revalidatePath("/socios");
  return { ok: true };
};

