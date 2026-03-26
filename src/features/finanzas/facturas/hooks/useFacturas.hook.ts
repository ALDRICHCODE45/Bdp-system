"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedFacturasAction } from "../server/actions/getPaginatedFacturasAction";
import { FacturasFilterParams } from "../types/FacturasFilterParams";
import type { PaginatedResult } from "@/core/shared/types/pagination.types";
import type { FacturaDto } from "../server/dtos/FacturaDto.dto";

/**
 * Fetches a paginated, filtered, sorted list of facturas.
 *
 * @param params      - Filter / pagination / sort params forwarded to the server action.
 * @param initialData - Optional SSR-prefetched data (from the Server Component page).
 *                      Only applied for the base unfiltered query (page 1, no filters).
 */
export const useFacturas = (
  params: FacturasFilterParams,
  initialData?: PaginatedResult<FacturaDto>
) => {
  const hasQuickFilters =
    (params.metodoPago?.length ?? 0) > 0 ||
    (params.medioPago?.length ?? 0) > 0 ||
    (params.moneda?.length ?? 0) > 0 ||
    (params.statusPago?.length ?? 0) > 0;

  const hasAdvancedFilters =
    (params.uuid?.length ?? 0) > 0 ||
    (params.usoCfdi?.length ?? 0) > 0 ||
    (params.rfcEmisor?.length ?? 0) > 0 ||
    (params.nombreEmisor?.length ?? 0) > 0 ||
    (params.rfcReceptor?.length ?? 0) > 0 ||
    (params.nombreReceptor?.length ?? 0) > 0 ||
    params.subtotalMin !== undefined ||
    params.subtotalMax !== undefined ||
    params.totalMin !== undefined ||
    params.totalMax !== undefined ||
    params.impTrasladosMin !== undefined ||
    params.impTrasladosMax !== undefined ||
    params.impRetenidosMin !== undefined ||
    params.impRetenidosMax !== undefined ||
    !!params.fechaPagoFrom ||
    !!params.fechaPagoTo ||
    (params.ingresadoPor?.length ?? 0) > 0 ||
    !!params.createdAtFrom ||
    !!params.createdAtTo ||
    !!params.updatedAtFrom ||
    !!params.updatedAtTo;

  const isBaseQuery =
    params.page === 1 &&
    (params.status?.length ?? 0) === 0 &&
    !params.search &&
    !params.sortBy &&
    !hasQuickFilters &&
    !hasAdvancedFilters;

  const applicableInitialData = isBaseQuery ? initialData : undefined;

  return useQuery({
    queryKey: [
      "facturas",
      params.page,
      params.pageSize,
      params.sortBy,
      params.sortOrder,
      params.search,
      params.status,
      // Quick filters
      params.metodoPago,
      params.medioPago,
      params.moneda,
      params.statusPago,
      // Advanced filters
      params.uuid,
      params.usoCfdi,
      params.rfcEmisor,
      params.nombreEmisor,
      params.rfcReceptor,
      params.nombreReceptor,
      params.subtotalMin,
      params.subtotalMax,
      params.totalMin,
      params.totalMax,
      params.impTrasladosMin,
      params.impTrasladosMax,
      params.impRetenidosMin,
      params.impRetenidosMax,
      params.fechaPagoFrom,
      params.fechaPagoTo,
      params.ingresadoPor,
      params.createdAtFrom,
      params.createdAtTo,
      params.updatedAtFrom,
      params.updatedAtTo,
    ],
    queryFn: async () => {
      const result = await getPaginatedFacturasAction(params);
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar facturas");
      }
      return result.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    initialData: applicableInitialData,
    initialDataUpdatedAt: applicableInitialData ? Date.now() : undefined,
  });
};
