"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getFacturasAggregatesAction } from "../server/actions/getFacturasAggregatesAction";
import { FacturasFilterParams } from "../types/FacturasFilterParams";

type AggregatesParams = Omit<
  FacturasFilterParams,
  "page" | "pageSize" | "sortBy" | "sortOrder"
>;

export function useFacturasAggregates(params: AggregatesParams) {
  return useQuery({
    queryKey: [
      "facturas-aggregates",
      params.search,
      params.status,
      params.metodoPago,
      params.moneda,
      params.statusPago,
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
      const result = await getFacturasAggregatesAction(params);
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
