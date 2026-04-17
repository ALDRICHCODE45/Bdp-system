"use server";
import { makeAsuntoJuridicoService } from "../services/makeAsuntoJuridicoService";
import { toAsuntoJuridicoDtoArray } from "../mappers/asuntoJuridicoMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import type { AsuntosJuridicosFilterParams } from "../../types/AsuntosJuridicosFilterParams";
import type { PaginatedResult } from "@/core/shared/types/pagination.types";
import type { AsuntoJuridicoDto } from "../dtos/AsuntoJuridicoDto.dto";

export const getPaginatedAsuntosJuridicosAction = async (
  params: AsuntosJuridicosFilterParams
): Promise<
  | { ok: true; data: PaginatedResult<AsuntoJuridicoDto> }
  | { ok: false; error: string }
> => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-asuntos"].acceder,
      PermissionActions["juridico-asuntos"].gestionar,
      PermissionActions["juridico-horas"].registrar,
    ],
    "No tienes permiso para ver asuntos jurídicos"
  );

  const page = Math.max(1, params.page);
  const pageSize = Math.min(Math.max(1, params.pageSize), 100);

  const service = makeAsuntoJuridicoService({ prisma });
  const result = await service.getPaginated({ ...params, page, pageSize });

  if (!result.ok) return { ok: false, error: result.error.message };

  const { data, totalCount } = result.value;

  return {
    ok: true,
    data: {
      data: toAsuntoJuridicoDtoArray(data),
      totalCount,
      page,
      pageSize,
      pageCount: Math.ceil(totalCount / pageSize),
    },
  };
};
