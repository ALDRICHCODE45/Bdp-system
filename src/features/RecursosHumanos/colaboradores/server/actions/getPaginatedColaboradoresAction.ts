"use server";
import { makeColaboradorService } from "../services/makeColaboradorService";
import { toColaboradorDtoArray } from "../mappers/colaboradorMapper";
import prisma from "@/core/lib/prisma";
import { PaginationParams, PaginatedResult } from "@/core/shared/types/pagination.types";
import { ColaboradorDto } from "../dtos/ColaboradorDto.dto";

export const getPaginatedColaboradoresAction = async (
  params: PaginationParams
): Promise<{ ok: true; data: PaginatedResult<ColaboradorDto> } | { ok: false; error: string }> => {
  const page = Math.max(1, params.page);
  const pageSize = Math.min(Math.max(1, params.pageSize), 100);

  const service = makeColaboradorService({ prisma });
  const result = await service.getPaginated({ page, pageSize, sortBy: params.sortBy, sortOrder: params.sortOrder });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const dtos = toColaboradorDtoArray(result.value.data);
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
