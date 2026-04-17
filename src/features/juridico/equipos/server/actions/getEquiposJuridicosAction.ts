"use server";
import { makeEquipoJuridicoService } from "../services/makeEquipoJuridicoService";
import { toEquipoJuridicoDtoArray } from "../mappers/equipoJuridicoMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const getEquiposJuridicosAction = async () => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-equipos"].acceder,
      PermissionActions["juridico-equipos"].gestionar,
      PermissionActions["juridico-horas"].registrar,
    ],
    "No tienes permiso para ver equipos jurídicos"
  );

  const service = makeEquipoJuridicoService({ prisma });
  const result = await service.getAll();

  if (!result.ok) return { ok: false as const, error: result.error.message };
  return { ok: true as const, data: toEquipoJuridicoDtoArray(result.value) };
};
