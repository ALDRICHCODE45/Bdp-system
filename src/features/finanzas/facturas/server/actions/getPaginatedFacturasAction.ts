"use server";
import { makeFacturaService } from "../services/makeFacturaService";
import { toFacturaDtoArray } from "../mappers/facturaMapper";
import prisma from "@/core/lib/prisma";
import { PaginatedResult } from "@/core/shared/types/pagination.types";
import { FacturaDto } from "../dtos/FacturaDto.dto";
import { FacturasFilterParams } from "../../types/FacturasFilterParams";

export const getPaginatedFacturasAction = async (
  params: FacturasFilterParams
): Promise<{ ok: true; data: PaginatedResult<FacturaDto> } | { ok: false; error: string }> => {
  const page = Math.max(1, params.page);
  const pageSize = Math.min(Math.max(1, params.pageSize), 100);

  const service = makeFacturaService({ prisma });
  const result = await service.getPaginated({
    ...params,
    page,
    pageSize,
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const dtos = toFacturaDtoArray(result.value.data);
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
