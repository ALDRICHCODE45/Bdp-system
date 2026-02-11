"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedAsistenciasAction } from "../server/actions/getPaginatedAsistenciasAction";
import { PaginationParams } from "@/core/shared/types/pagination.types";

export const useAsistencias = (params: PaginationParams) => {
  return useQuery({
    queryKey: ["asistencias", params.page, params.pageSize, params.sortBy, params.sortOrder],
    queryFn: async () => {
      const result = await getPaginatedAsistenciasAction(params);
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar asistencias");
      }
      return result.data;
    },
    placeholderData: keepPreviousData,
  });
};
