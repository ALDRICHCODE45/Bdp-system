"use server";
import { revalidatePath } from "next/cache";
import { makeEquipoJuridicoService } from "../services/makeEquipoJuridicoService";
import { miembroEquipoSchema } from "../validators/miembroEquipoSchema";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const removeMiembroEquipoAction = async (input: {
  equipoId: string;
  usuarioId: string;
}) => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-equipos"].editar,
      PermissionActions["juridico-equipos"].gestionar,
    ],
    "No tienes permiso para gestionar miembros de equipos jurídicos"
  );

  const parsed = miembroEquipoSchema.parse(input);
  const service = makeEquipoJuridicoService({ prisma });
  const result = await service.removeMiembro(parsed.equipoId, parsed.usuarioId);

  if (!result.ok) return { ok: false as const, error: result.error.message };

  revalidatePath("/juridico/equipos");
  return { ok: true as const };
};
