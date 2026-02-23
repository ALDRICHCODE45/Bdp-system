"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedFacturasAction } from "../server/actions/getPaginatedFacturasAction";
import { FacturasFilterParams } from "../types/FacturasFilterParams";

export const useFacturas = (params: FacturasFilterParams) => {
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
      params.totalMin,
      params.totalMax,
      params.statusPago,
    ],
    queryFn: async () => {
      const result = await getPaginatedFacturasAction(params);
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar facturas");
      }
      return result.data;
    },
    placeholderData: keepPreviousData,
  });
};
