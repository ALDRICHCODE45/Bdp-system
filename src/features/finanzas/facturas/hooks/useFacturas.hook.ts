"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedFacturasAction } from "../server/actions/getPaginatedFacturasAction";
import { FacturasFilterParams } from "../types/FacturasFilterParams";
import type { PaginatedResult } from "@/core/shared/types/pagination.types";
import type { FacturaDto } from "../server/dtos/FacturaDto.dto";

/**
 * Fetches a paginated, filtered, sorted list of facturas.
 *
 * @param params   - Filter / pagination / sort params forwarded to the server action.
 * @param initialData - Optional SSR-prefetched data (from the Server Component page).
 *                      When provided the skeleton is never shown on first render.
 */
export const useFacturas = (
  params: FacturasFilterParams,
  initialData?: PaginatedResult<FacturaDto>
) => {
  // Only apply SSR initialData for the base unfiltered query (page 1, no filters).
  // Every other queryKey must always fetch fresh from the server — passing
  // initialData with `initialDataUpdatedAt: Date.now()` would make TanStack Query
  // consider those entries as "fresh" and skip the server fetch entirely,
  // causing all filter/tab/search changes to appear broken (data never updates).
  const isBaseQuery =
    params.page === 1 &&
    !params.status &&
    !params.metodoPago &&
    !params.moneda &&
    !params.statusPago &&
    !params.search &&
    !params.sortBy;

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
      params.metodoPago,
      params.moneda,
      params.statusPago,
    ],
    queryFn: async () => {
      const result = await getPaginatedFacturasAction(params);
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar facturas");
      }
      return result.data;
    },
    // Show previous data while a new fetch is in-flight (filter / page changes).
    placeholderData: keepPreviousData,
    // Treat SSR data as fresh for 30 s to avoid an immediate client refetch.
    staleTime: 30_000,
    // Hydrate from the Server Component prefetch only for the base query.
    initialData: applicableInitialData,
    initialDataUpdatedAt: applicableInitialData ? Date.now() : undefined,
  });
};
