"use server";
import { makeClienteProveedorService } from "../services/makeClienteProveedorService";
import { toClienteProveedorDtoArray } from "../mappers/clienteProveedorMapper";
import prisma from "@/core/lib/prisma";
import { PaginatedResult } from "@/core/shared/types/pagination.types";
import { ClienteProveedorDto } from "../dtos/ClienteProveedorDto.dto";
import type { ClientesProveedoresFilterParams } from "../../types/ClientesProveedoresFilterParams";

export const getPaginatedClientesProveedoresAction = async (
  params: ClientesProveedoresFilterParams,
): Promise<
  | { ok: true; data: PaginatedResult<ClienteProveedorDto> }
  | { ok: false; error: string }
> => {
  const page = Math.max(1, params.page);
  const pageSize = Math.min(Math.max(1, params.pageSize), 100);

  const service = makeClienteProveedorService({ prisma });
  const result = await service.getPaginated({
    page,
    pageSize,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    search: params.search?.trim() || undefined,
    tipo: params.tipo,
    activo: params.activo,
    banco: params.banco,
    socioResponsable: params.socioResponsable?.trim() || undefined,
    fechaRegistroFrom: params.fechaRegistroFrom,
    fechaRegistroTo: params.fechaRegistroTo,
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const dtos = toClienteProveedorDtoArray(result.value.data);
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
