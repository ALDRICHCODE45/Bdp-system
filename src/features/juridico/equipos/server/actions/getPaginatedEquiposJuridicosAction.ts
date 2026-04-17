"use server";
import { makeEquipoJuridicoService } from "../services/makeEquipoJuridicoService";
import { toEquipoJuridicoDtoArray } from "../mappers/equipoJuridicoMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import type { EquiposJuridicosFilterParams } from "../../types/EquiposJuridicosFilterParams";
import type { PaginatedResult } from "@/core/shared/types/pagination.types";
import type { EquipoJuridicoDto } from "../dtos/EquipoJuridicoDto.dto";

export const getPaginatedEquiposJuridicosAction = async (
  params: EquiposJuridicosFilterParams
): Promise<
  | { ok: true; data: PaginatedResult<EquipoJuridicoDto> }
  | { ok: false; error: string }
> => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-equipos"].acceder,
      PermissionActions["juridico-equipos"].gestionar,
      PermissionActions["juridico-horas"].registrar,
    ],
    "No tienes permiso para ver equipos jurídicos"
  );

  const page = Math.max(1, params.page);
  const pageSize = Math.min(Math.max(1, params.pageSize), 100);

  const service = makeEquipoJuridicoService({ prisma });
  const result = await service.getPaginated({ ...params, page, pageSize });

  if (!result.ok) return { ok: false, error: result.error.message };

  const { data, totalCount } = result.value;

  return {
    ok: true,
    data: {
      data: toEquipoJuridicoDtoArray(data),
      totalCount,
      page,
      pageSize,
      pageCount: Math.ceil(totalCount / pageSize),
    },
  };
};
