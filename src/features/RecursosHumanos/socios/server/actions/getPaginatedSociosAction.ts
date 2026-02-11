"use server";
import { makeSocioService } from "../services/makeSocioService";
import { toSocioDtoArray } from "../mappers/socioMapper";
import prisma from "@/core/lib/prisma";
import { PaginationParams, PaginatedResult } from "@/core/shared/types/pagination.types";
import { SocioDto } from "../dtos/SocioDto.dto";

export const getPaginatedSociosAction = async (
  params: PaginationParams
): Promise<{ ok: true; data: PaginatedResult<SocioDto> } | { ok: false; error: string }> => {
  const page = Math.max(1, params.page);
  const pageSize = Math.min(Math.max(1, params.pageSize), 100);

  const service = makeSocioService({ prisma });
  const result = await service.getPaginated({ page, pageSize, sortBy: params.sortBy, sortOrder: params.sortOrder });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const dtos = toSocioDtoArray(result.value.data);
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
