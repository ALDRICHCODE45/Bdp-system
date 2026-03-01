"use client";

import { useQuery } from "@tanstack/react-query";
import { getFacturaStatusCountsAction } from "../server/actions/getFacturaStatusCountsAction";
import type { FacturasFilterParams } from "../types/FacturasFilterParams";

type CountFilters = Omit<FacturasFilterParams, "page" | "pageSize" | "sortBy" | "sortOrder" | "status">;

/**
 * Trae el conteo de facturas por status en una sola query groupBy.
 * Respeta todos los filtros activos excepto `status`.
 */
export function useFacturaStatusCounts(filters: CountFilters) {
  return useQuery({
    queryKey: [
      "facturas-status-counts",
      filters.search,
      filters.metodoPago,
      filters.moneda,
      filters.statusPago,
      filters.uuid,
      filters.usoCfdi,
      filters.rfcEmisor,
      filters.nombreEmisor,
      filters.rfcReceptor,
      filters.nombreReceptor,
      filters.subtotalMin,
      filters.subtotalMax,
      filters.totalMin,
      filters.totalMax,
      filters.impTrasladosMin,
      filters.impTrasladosMax,
      filters.impRetenidosMin,
      filters.impRetenidosMax,
      filters.fechaPagoFrom,
      filters.fechaPagoTo,
      filters.ingresadoPor,
      filters.createdAtFrom,
      filters.createdAtTo,
      filters.updatedAtFrom,
      filters.updatedAtTo,
    ],
    queryFn: async () => {
      const result = await getFacturaStatusCountsAction(filters);
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
    staleTime: 30_000,
  });
}
