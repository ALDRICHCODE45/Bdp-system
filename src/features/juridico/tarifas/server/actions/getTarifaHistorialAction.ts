"use server";

import prisma from "@/core/lib/prisma";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { makeTarifaAbogadoAsuntoService } from "../services/makeTarifaAbogadoAsuntoService";
import { toTarifaAbogadoAsuntoHistorialDtoArray } from "../mappers/tarifaAbogadoAsuntoHistorialMapper";
import { getTarifaHistorialSchema } from "../validators/tarifasValidator";

export const getTarifaHistorialAction = async (input: unknown) => {
  await requireAnyPermission(
    [PermissionActions["juridico-tarifas"].gestionar],
    "No tienes permiso para ver el historial de tarifas",
  );

  const parsed = getTarifaHistorialSchema.parse(input);
  const service = makeTarifaAbogadoAsuntoService({ prisma });
  const result = await service.getHistorialByTarifaId(parsed.id);

  if (!result.ok) return { ok: false as const, error: result.error.message };
  return {
    ok: true as const,
    data: toTarifaAbogadoAsuntoHistorialDtoArray(result.value),
  };
};
