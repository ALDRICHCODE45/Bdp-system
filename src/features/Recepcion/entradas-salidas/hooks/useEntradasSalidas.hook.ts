"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedEntradasSalidasAction } from "../server/actions/getPaginatedEntradasSalidasAction";
import { PaginationParams } from "@/core/shared/types/pagination.types";

export const useEntradasSalidas = (params: PaginationParams) => {
  return useQuery({
    queryKey: ["entradas-salidas", params.page, params.pageSize, params.sortBy, params.sortOrder],
    queryFn: async () => {
      const result = await getPaginatedEntradasSalidasAction(params);
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar entradas y salidas");
      }
      return result.data;
    },
    placeholderData: keepPreviousData,
  });
};
