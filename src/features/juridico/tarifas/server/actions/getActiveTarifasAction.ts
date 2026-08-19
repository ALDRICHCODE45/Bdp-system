"use server";

import prisma from "@/core/lib/prisma";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { makeTarifaAbogadoAsuntoService } from "../services/makeTarifaAbogadoAsuntoService";
import { toTarifaAbogadoAsuntoDtoArray } from "../mappers/tarifaAbogadoAsuntoMapper";

/**
 * Devuelve TODAS las tarifas activas (vista matriz del módulo).
 * Solo accesible para quien gestiona tarifas.
 */
export const getActiveTarifasAction = async () => {
  await requireAnyPermission(
    [PermissionActions["juridico-tarifas"].gestionar],
    "No tienes permiso para ver tarifas",
  );

  const service = makeTarifaAbogadoAsuntoService({ prisma });
  const result = await service.getAllActive();

  if (!result.ok) return { ok: false as const, error: result.error.message };
  return {
    ok: true as const,
    data: toTarifaAbogadoAsuntoDtoArray(result.value),
  };
};
