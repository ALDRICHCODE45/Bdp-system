"use server";

import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import prisma from "@/core/lib/prisma";
import { makeReporteHorasAgrupadoService } from "../services/makeReporteHorasAgrupadoService";
import {
  reporteHorasExportSchema,
  type ReporteHorasExportSchemaInput,
} from "../validators/reporteHorasExportSchema";
import type { ReporteGrupoDto } from "../dtos/ReporteHorasAgrupadoDto.dto";

/**
 * Server action: devuelve TODOS los grupos que cumplen los filtros (sin paginación).
 * Usado por la exportación Excel + PDF summary.
 * Permisos: `juridico-horas:ver-reportes` OR `juridico-horas:gestionar`.
 */
export const getHorasAgrupadasExportAction = async (
  input: ReporteHorasExportSchemaInput
): Promise<
  | { ok: true; data: ReporteGrupoDto[] }
  | { ok: false; error: string }
> => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-horas"]["ver-reportes"],
      PermissionActions["juridico-horas"].gestionar,
    ],
    "No tienes permiso para exportar reportes de horas"
  );

  const parsed = reporteHorasExportSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Parámetros inválidos",
    };
  }

  const service = makeReporteHorasAgrupadoService({ prisma });
  const result = await service.getAgrupadoAll(parsed.data.filters);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  return { ok: true, data: result.value };
};
