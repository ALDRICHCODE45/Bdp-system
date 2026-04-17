"use server";
import { revalidatePath } from "next/cache";
import { makeEquipoJuridicoService } from "../services/makeEquipoJuridicoService";
import { updateEquipoJuridicoSchema } from "../validators/updateEquipoJuridicoSchema";
import { toEquipoJuridicoDto } from "../mappers/equipoJuridicoMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const updateEquipoJuridicoAction = async (input: unknown) => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-equipos"].editar,
      PermissionActions["juridico-equipos"].gestionar,
    ],
    "No tienes permiso para editar equipos jurídicos"
  );

  const parsed = updateEquipoJuridicoSchema.parse(input);
  const service = makeEquipoJuridicoService({ prisma });
  const result = await service.update(parsed);

  if (!result.ok) return { ok: false as const, error: result.error.message };

  revalidatePath("/juridico/equipos");
  return { ok: true as const, data: toEquipoJuridicoDto(result.value) };
};
