"use server";

import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import prisma from "@/core/lib/prisma";
import type { DashboardHorasFilters } from "../dtos/DashboardHorasDto.dto";
import { makeDashboardHorasService } from "../services/makeDashboardHorasService";

export const getDashboardHorasAction = async (filters: DashboardHorasFilters) => {
  await requireAnyPermission(
    [PermissionActions["juridico-horas"].gestionar],
    "No tienes permiso para ver el dashboard de horas"
  );

  const service = makeDashboardHorasService({ prisma });
  const result = await service.getDashboardData(filters);

  if (!result.ok) return { ok: false as const, error: result.error.message };
  return { ok: true as const, data: result.value };
};
