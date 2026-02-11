"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedFacturasAction } from "../server/actions/getPaginatedFacturasAction";
import { PaginationParams } from "@/core/shared/types/pagination.types";

export const useFacturas = (params: PaginationParams) => {
  return useQuery({
    queryKey: ["facturas", params.page, params.pageSize, params.sortBy, params.sortOrder],
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
