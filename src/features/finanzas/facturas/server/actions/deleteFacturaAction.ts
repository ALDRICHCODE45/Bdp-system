"use server";
import { revalidatePath } from "next/cache";
import { makeFacturaService } from "../services/makeFacturaService";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const deleteFacturaAction = async (id: string) => {
  await requireAnyPermission(
    [PermissionActions.facturas.eliminar, PermissionActions.facturas.gestionar],
    "No tienes permiso para eliminar la factura"
  );

  const facturaService = makeFacturaService({ prisma });
  const result = await facturaService.delete(id);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  revalidatePath("/facturas");
  return { ok: true };
};
