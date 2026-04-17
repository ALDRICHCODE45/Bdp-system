"use server";
import { revalidatePath } from "next/cache";
import { makeAsuntoJuridicoService } from "../services/makeAsuntoJuridicoService";
import { createAsuntoJuridicoSchema } from "../validators/createAsuntoJuridicoSchema";
import { toAsuntoJuridicoDto } from "../mappers/asuntoJuridicoMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const createAsuntoJuridicoAction = async (input: unknown) => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-asuntos"].crear,
      PermissionActions["juridico-asuntos"].gestionar,
    ],
    "No tienes permiso para crear asuntos jurídicos"
  );

  const parsed = createAsuntoJuridicoSchema.parse(input);
  const service = makeAsuntoJuridicoService({ prisma });
  const result = await service.create(parsed);

  if (!result.ok) return { ok: false as const, error: result.error.message };

  revalidatePath("/juridico/asuntos");
  return { ok: true as const, data: toAsuntoJuridicoDto(result.value) };
};
