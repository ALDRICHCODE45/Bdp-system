"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedEgresosAction } from "../server/actions/getPaginatedEgresosAction";
import { PaginationParams } from "@/core/shared/types/pagination.types";

export const useEgresos = (params: PaginationParams) => {
  return useQuery({
    queryKey: ["egresos", params.page, params.pageSize, params.sortBy, params.sortOrder],
    queryFn: async () => {
      const result = await getPaginatedEgresosAction(params);
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar egresos");
      }
      return result.data;
    },
    placeholderData: keepPreviousData,
  });
};
