"use server";
import { makeAutorizacionEdicionService } from "../services/makeAutorizacionEdicionService";
import { toAutorizacionEdicionDtoArray } from "../mappers/autorizacionEdicionMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const getAutorizacionesPendientesAction = async () => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-horas"]["autorizar-edicion"],
      PermissionActions["juridico-horas"].gestionar,
    ],
    "No tienes permiso para ver solicitudes de edición"
  );

  const service = makeAutorizacionEdicionService({ prisma });
  const result = await service.getPendientes();

  if (!result.ok) return { ok: false as const, error: result.error.message };

  return {
    ok: true as const,
    data: toAutorizacionEdicionDtoArray(result.value),
  };
};
