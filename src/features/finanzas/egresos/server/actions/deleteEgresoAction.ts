"use server";
import { revalidatePath } from "next/cache";
import { makeEgresoService } from "../services/makeEgresoService";
import prisma from "@/core/lib/prisma";
import { z } from "zod";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const deleteEgresoAction = async (id: string) => {
  // Verificar permiso antes de continuar
  await requireAnyPermission(
    [
      PermissionActions.egresos.eliminar,
      PermissionActions.egresos.gestionar,
    ],
    "No tienes permiso para eliminar egresos"
  );

  // Validar el ID
  const idSchema = z.string().uuid("ID de egreso inválido");
  
  try {
    idSchema.parse(id);
  } catch {
    return { ok: false, error: "ID de egreso inválido" };
  }

  const egresoService = makeEgresoService({ prisma });
  const result = await egresoService.delete(id);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  revalidatePath("/egresos");
  return { ok: true };
};

