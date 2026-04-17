"use server";
import { makeAsuntoJuridicoService } from "../services/makeAsuntoJuridicoService";
import { toAsuntoJuridicoDtoArray } from "../mappers/asuntoJuridicoMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const getAsuntosJuridicosAction = async () => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-asuntos"].acceder,
      PermissionActions["juridico-asuntos"].gestionar,
      PermissionActions["juridico-horas"].registrar,
    ],
    "No tienes permiso para ver asuntos jurídicos"
  );

  const service = makeAsuntoJuridicoService({ prisma });
  const result = await service.getAll();

  if (!result.ok) return { ok: false as const, error: result.error.message };
  return { ok: true as const, data: toAsuntoJuridicoDtoArray(result.value) };
};
