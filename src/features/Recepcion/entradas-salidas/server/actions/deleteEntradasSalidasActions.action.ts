"use server";

import { revalidatePath } from "next/cache";
import { makeEntradasSalidasService } from "../services/makeEntradasSalidasService";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const deleteEntradasSalidasAction = async (id: string) => {
  // Verificar permiso antes de continuar
  await requireAnyPermission(
    [
      PermissionActions.recepcion.eliminar,
      PermissionActions.recepcion.gestionar,
    ],
    "No tienes permiso para eliminar entradas y salidas"
  );
  try {
    const entradasSalidasService = makeEntradasSalidasService({ prisma });
    const result = await entradasSalidasService.delete(id);

    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }

    revalidatePath("/entradas-salidas");
    return { ok: true };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Error al eliminar la entrada o salida" };
  }
};

