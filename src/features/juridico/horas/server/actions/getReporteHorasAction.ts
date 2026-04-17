"use server";
import { makeReporteHorasService } from "../services/makeReporteHorasService";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import type { ReporteHorasFilters } from "../dtos/ReporteHorasDto.dto";

export const getReporteHorasAction = async (filters: ReporteHorasFilters) => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-horas"]["ver-reportes"],
      PermissionActions["juridico-horas"].gestionar,
    ],
    "No tienes permiso para ver reportes de horas"
  );

  const service = makeReporteHorasService({ prisma });
  const result = await service.getReporte(filters);

  if (!result.ok) return { ok: false as const, error: result.error.message };
  return { ok: true as const, data: result.value };
};
