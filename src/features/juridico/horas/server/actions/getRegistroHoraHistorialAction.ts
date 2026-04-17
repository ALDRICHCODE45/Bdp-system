"use server";
import { makeRegistroHoraHistorialService } from "../services/makeRegistroHoraHistorialService";
import { toRegistroHoraHistorialDtoArray } from "../mappers/registroHoraHistorialMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const getRegistroHoraHistorialAction = async (
  registroHoraId: string
) => {
  await requireAnyPermission(
    [PermissionActions["juridico-horas"].acceder],
    "No tienes permiso para ver el historial de registros"
  );

  const service = makeRegistroHoraHistorialService({ prisma });
  const result = await service.getHistorial(registroHoraId);

  if (!result.ok) return { ok: false as const, error: result.error.message };

  return {
    ok: true as const,
    data: toRegistroHoraHistorialDtoArray(result.value),
  };
};
