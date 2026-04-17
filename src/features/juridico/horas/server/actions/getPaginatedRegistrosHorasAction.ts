"use server";
import { auth } from "@/core/lib/auth/auth";
import { makeRegistroHoraService } from "../services/makeRegistroHoraService";
import { toRegistroHoraDtoArray } from "../mappers/registroHoraMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { hasAnyPermission } from "@/core/lib/permissions/permission-checker";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import type { RegistroHorasFilterParams } from "../../types/RegistroHorasFilterParams";
import type { PaginatedResult } from "@/core/shared/types/pagination.types";
import type { RegistroHoraDto } from "../dtos/RegistroHoraDto.dto";

export const getPaginatedRegistrosHorasAction = async (
  params: RegistroHorasFilterParams
): Promise<
  | { ok: true; data: PaginatedResult<RegistroHoraDto> }
  | { ok: false; error: string }
> => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-horas"].acceder,
      PermissionActions["juridico-horas"].registrar,
      PermissionActions["juridico-horas"].gestionar,
    ],
    "No tienes permiso para acceder al módulo de horas"
  );

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "No autenticado" };
  }

  const page = Math.max(1, params.page);
  const pageSize = Math.min(Math.max(1, params.pageSize), 100);

  const userPermissions = session.user.permissions || [];

  // Use hasAnyPermission which correctly handles admin:all
  const isAdmin = hasAnyPermission(userPermissions, [
    PermissionActions["juridico-horas"].gestionar,
    PermissionActions["juridico-horas"]["ver-reportes"],
  ]);

  // Non-admin users can only see their own records
  const effectiveParams: RegistroHorasFilterParams = {
    ...params,
    page,
    pageSize,
    usuarioId: isAdmin ? params.usuarioId : session.user.id,
  };

  const service = makeRegistroHoraService({ prisma });
  const result = await service.getPaginated(effectiveParams);

  if (!result.ok) return { ok: false, error: result.error.message };

  const { data, totalCount } = result.value;

  return {
    ok: true,
    data: {
      data: toRegistroHoraDtoArray(data),
      totalCount,
      page,
      pageSize,
      pageCount: Math.ceil(totalCount / pageSize),
    },
  };
};
