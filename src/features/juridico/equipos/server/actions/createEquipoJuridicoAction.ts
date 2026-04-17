"use server";
import { revalidatePath } from "next/cache";
import { makeEquipoJuridicoService } from "../services/makeEquipoJuridicoService";
import { createEquipoJuridicoSchema } from "../validators/createEquipoJuridicoSchema";
import { toEquipoJuridicoDto } from "../mappers/equipoJuridicoMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const createEquipoJuridicoAction = async (input: unknown) => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-equipos"].crear,
      PermissionActions["juridico-equipos"].gestionar,
    ],
    "No tienes permiso para crear equipos jurídicos"
  );

  const parsed = createEquipoJuridicoSchema.parse(input);
  const service = makeEquipoJuridicoService({ prisma });
  const result = await service.create(parsed);

  if (!result.ok) return { ok: false as const, error: result.error.message };

  revalidatePath("/juridico/equipos");
  return { ok: true as const, data: toEquipoJuridicoDto(result.value) };
};
