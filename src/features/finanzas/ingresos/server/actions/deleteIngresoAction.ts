"use server";
import { revalidatePath } from "next/cache";
import { makeIngresoService } from "../services/makeIngresoService";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const deleteIngresoAction = async (id: string) => {
  // Verificar permiso antes de continuar
  await requireAnyPermission(
    [
      PermissionActions.ingresos.eliminar,
      PermissionActions.ingresos.gestionar,
    ],
    "No tienes permiso para eliminar ingresos"
  );
  try {
    const ingresoService = makeIngresoService({ prisma });
    const result = await ingresoService.delete(id);

    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }

    revalidatePath("/ingresos");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al eliminar ingreso",
    };
  }
};

