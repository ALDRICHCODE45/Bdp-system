"use server";
import { revalidatePath } from "next/cache";
import { makeAsuntoJuridicoService } from "../services/makeAsuntoJuridicoService";
import prisma from "@/core/lib/prisma";
import { z } from "zod";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const deleteAsuntoJuridicoAction = async (id: string) => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-asuntos"].eliminar,
      PermissionActions["juridico-asuntos"].gestionar,
    ],
    "No tienes permiso para cerrar asuntos jurídicos"
  );

  const idSchema = z.string().uuid("ID de asunto jurídico inválido");
  try {
    idSchema.parse(id);
  } catch {
    return { ok: false as const, error: "ID de asunto jurídico inválido" };
  }

  const service = makeAsuntoJuridicoService({ prisma });
  const result = await service.close(id);

  if (!result.ok) return { ok: false as const, error: result.error.message };

  revalidatePath("/juridico/asuntos");
  return { ok: true as const };
};
