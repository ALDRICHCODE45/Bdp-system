"use server";
import { revalidatePath } from "next/cache";
import { makeEquipoJuridicoService } from "../services/makeEquipoJuridicoService";
import prisma from "@/core/lib/prisma";
import { z } from "zod";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const deleteEquipoJuridicoAction = async (id: string) => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-equipos"].eliminar,
      PermissionActions["juridico-equipos"].gestionar,
    ],
    "No tienes permiso para eliminar equipos jurídicos"
  );

  const idSchema = z.string().uuid("ID de equipo jurídico inválido");
  try {
    idSchema.parse(id);
  } catch {
    return { ok: false as const, error: "ID de equipo jurídico inválido" };
  }

  const service = makeEquipoJuridicoService({ prisma });
  const result = await service.delete(id);

  if (!result.ok) return { ok: false as const, error: result.error.message };

  revalidatePath("/juridico/equipos");
  return { ok: true as const };
};
