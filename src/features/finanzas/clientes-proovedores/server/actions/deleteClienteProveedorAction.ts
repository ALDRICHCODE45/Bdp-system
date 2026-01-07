"use server";
import { revalidatePath } from "next/cache";
import { makeClienteProveedorService } from "../services/makeClienteProveedorService";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const deleteClienteProveedorAction = async (id: string) => {
  await requireAnyPermission(
    [
      PermissionActions["clientes-proovedores"].eliminar,
      PermissionActions["clientes-proovedores"].gestionar,
    ],
    "No tienes permiso eliminar el cliente/proovedor"
  );

  const clienteProveedorService = makeClienteProveedorService({ prisma });
  const result = await clienteProveedorService.delete(id);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  revalidatePath("/clientes-proovedores");
  return { ok: true };
};
