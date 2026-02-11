"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedIngresosAction } from "../server/actions/getPaginatedIngresosAction";
import { PaginationParams } from "@/core/shared/types/pagination.types";

export const useIngresos = (params: PaginationParams) => {
  return useQuery({
    queryKey: ["ingresos", params.page, params.pageSize, params.sortBy, params.sortOrder],
    queryFn: async () => {
      const result = await getPaginatedIngresosAction(params);
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar ingresos");
      }
      return result.data;
    },
    placeholderData: keepPreviousData,
  });
};
