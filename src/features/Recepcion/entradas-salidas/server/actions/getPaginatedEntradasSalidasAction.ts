"use server";
import { makeEntradasSalidasService } from "../services/makeEntradasSalidasService";
import prisma from "@/core/lib/prisma";
import { PaginationParams, PaginatedResult } from "@/core/shared/types/pagination.types";
import { EntradasSalidasDTO } from "../dtos/EntradasSalidasDto.dto";

export const getPaginatedEntradasSalidasAction = async (
  params: PaginationParams
): Promise<{ ok: true; data: PaginatedResult<EntradasSalidasDTO> } | { ok: false; error: string }> => {
  const page = Math.max(1, params.page);
  const pageSize = Math.min(Math.max(1, params.pageSize), 100);

  const service = makeEntradasSalidasService({ prisma });
  const result = await service.getPaginated({ page, pageSize, sortBy: params.sortBy, sortOrder: params.sortOrder, search: params.search });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  return {
    ok: true,
    data: {
      data: result.value.data,
      totalCount: result.value.totalCount,
      page,
      pageSize,
      pageCount: Math.ceil(result.value.totalCount / pageSize),
    },
  };
};
