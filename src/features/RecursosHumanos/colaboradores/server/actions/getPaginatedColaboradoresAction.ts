"use server";
import { makeColaboradorService } from "../services/makeColaboradorService";
import { toColaboradorDtoArray } from "../mappers/colaboradorMapper";
import prisma from "@/core/lib/prisma";
import { PaginatedResult } from "@/core/shared/types/pagination.types";
import { ColaboradorDto } from "../dtos/ColaboradorDto.dto";
import type {
  ColaboradoresFilterParams,
  ColaboradorEstadoFilter,
} from "../../types/ColaboradoresFilterParams";

const ALLOWED_STATUSES = new Set<ColaboradorEstadoFilter>([
  "CONTRATADO",
  "DESPEDIDO",
  "EN_LICENCIA",
]);

/**
 * Server Action: paginated, filtered, sorted list of colaboradores.
 *
 * Filters (P1):
 * - status?: ColaboradorEstado[] (tab filter — validated)
 * - search?: string (case-insensitive contains over name + correo + puesto)
 */
export const getPaginatedColaboradoresAction = async (
  params: ColaboradoresFilterParams
): Promise<
  | { ok: true; data: PaginatedResult<ColaboradorDto> }
  | { ok: false; error: string }
> => {
  const page = Math.max(1, params.page);
  const pageSize = Math.min(Math.max(1, params.pageSize), 100);

  // Validate & sanitize status — server-side defense, even though Prisma enum
  // would reject unknown values. Strip invalid entries silently.
  const status = params.status?.filter((s) => ALLOWED_STATUSES.has(s));

  const service = makeColaboradorService({ prisma });
  const result = await service.getPaginated({
    page,
    pageSize,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    status: status && status.length > 0 ? status : undefined,
    search: params.search?.trim() ? params.search.trim() : undefined,
  });

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