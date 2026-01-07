"use server";
import { revalidatePath } from "next/cache";
import { makeColaboradorService } from "../services/makeColaboradorService";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const deleteColaboradorAction = async (id: string) => {
  // Verificar permiso antes de continuar
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.eliminar,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para eliminar colaboradores"
  );
  const colaboradorService = makeColaboradorService({ prisma });
  const result = await colaboradorService.delete(id);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  revalidatePath("/colaboradores");
  return { ok: true };
};

