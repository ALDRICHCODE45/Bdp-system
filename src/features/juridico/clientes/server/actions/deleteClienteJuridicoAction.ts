"use server";
import { revalidatePath } from "next/cache";
import { makeClienteJuridicoService } from "../services/makeClienteJuridicoService";
import prisma from "@/core/lib/prisma";
import { z } from "zod";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const deleteClienteJuridicoAction = async (id: string) => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-clientes"].eliminar,
      PermissionActions["juridico-clientes"].gestionar,
    ],
    "No tienes permiso para eliminar clientes jurídicos"
  );

  const idSchema = z.string().uuid("ID de cliente jurídico inválido");
  try {
    idSchema.parse(id);
  } catch {
    return { ok: false as const, error: "ID de cliente jurídico inválido" };
  }

  const service = makeClienteJuridicoService({ prisma });
  const result = await service.delete(id);

  if (!result.ok) return { ok: false as const, error: result.error.message };

  revalidatePath("/juridico/clientes");
  return { ok: true as const };
};
