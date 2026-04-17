"use server";
import { makeClienteJuridicoService } from "../services/makeClienteJuridicoService";
import { toClienteJuridicoDtoArray } from "../mappers/clienteJuridicoMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import type { ClientesJuridicosFilterParams } from "../../types/ClientesJuridicosFilterParams";
import type { PaginatedResult } from "@/core/shared/types/pagination.types";
import type { ClienteJuridicoDto } from "../dtos/ClienteJuridicoDto.dto";

export const getPaginatedClientesJuridicosAction = async (
  params: ClientesJuridicosFilterParams
): Promise<
  | { ok: true; data: PaginatedResult<ClienteJuridicoDto> }
  | { ok: false; error: string }
> => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-clientes"].acceder,
      PermissionActions["juridico-clientes"].gestionar,
      PermissionActions["juridico-horas"].registrar,
    ],
    "No tienes permiso para ver clientes jurídicos"
  );

  const page = Math.max(1, params.page);
  const pageSize = Math.min(Math.max(1, params.pageSize), 100);

  const service = makeClienteJuridicoService({ prisma });
  const result = await service.getPaginated({ ...params, page, pageSize });

  if (!result.ok) return { ok: false, error: result.error.message };

  const { data, totalCount } = result.value;

  return {
    ok: true,
    data: {
      data: toClienteJuridicoDtoArray(data),
      totalCount,
      page,
      pageSize,
      pageCount: Math.ceil(totalCount / pageSize),
    },
  };
};
