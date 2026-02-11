"use server";
import { makeEgresoService } from "../services/makeEgresoService";
import { toEgresoDtoArray } from "../mappers/egresoMapper";
import prisma from "@/core/lib/prisma";
import { PaginationParams, PaginatedResult } from "@/core/shared/types/pagination.types";
import { EgresoDto } from "../dtos/EgresoDto.dto";

export const getPaginatedEgresosAction = async (
  params: PaginationParams
): Promise<{ ok: true; data: PaginatedResult<EgresoDto> } | { ok: false; error: string }> => {
  const page = Math.max(1, params.page);
  const pageSize = Math.min(Math.max(1, params.pageSize), 100);

  const service = makeEgresoService({ prisma });
  const result = await service.getPaginated({ page, pageSize, sortBy: params.sortBy, sortOrder: params.sortOrder });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const dtos = toEgresoDtoArray(result.value.data);
  return {
    ok: true,
    data: {
      data: dtos,
      totalCount: result.value.totalCount,
      page,
      pageSize,
      pageCount: Math.ceil(result.value.totalCount / pageSize),
    },
  };
};
