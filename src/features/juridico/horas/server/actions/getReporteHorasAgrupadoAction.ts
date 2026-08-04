"use server";

import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import prisma from "@/core/lib/prisma";
import { makeReporteHorasAgrupadoService } from "../services/makeReporteHorasAgrupadoService";
import {
  reporteHorasAgrupadoSchema,
  type ReporteHorasAgrupadoSchemaInput,
} from "../validators/reporteHorasAgrupadoSchema";
import type {
  ReporteAgrupadoPageDto,
  ReporteAgrupadoSort,
} from "../dtos/ReporteHorasAgrupadoDto.dto";

/**
 * Server action: devuelve una página del reporte agrupado + subtotales.
 * Permisos: `juridico-horas:ver-reportes` OR `juridico-horas:gestionar`.
 */
export const getReporteHorasAgrupadoAction = async (
  input: ReporteHorasAgrupadoSchemaInput,
): Promise<
  { ok: true; data: ReporteAgrupadoPageDto } | { ok: false; error: string }
> => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-horas"]["ver-reportes"],
      PermissionActions["juridico-horas"].gestionar,
    ],
    "No tienes permiso para ver reportes de horas",
  );

  const parsed = reporteHorasAgrupadoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Parámetros inválidos",
    };
  }

  const sort: ReporteAgrupadoSort | undefined = parsed.data.sort
    ? {
        field: parsed.data.sort.field,
        direction: parsed.data.sort.direction,
      }
    : undefined;

  const service = makeReporteHorasAgrupadoService({ prisma });
  const result = await service.getAgrupado({
    filters: parsed.data.filters,
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
    sort,
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  return { ok: true, data: result.value };
};
