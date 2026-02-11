"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedColaboradoresAction } from "../server/actions/getPaginatedColaboradoresAction";
import { PaginationParams } from "@/core/shared/types/pagination.types";

export const useColaboradores = (params: PaginationParams) => {
  return useQuery({
    queryKey: ["colaboradores", params.page, params.pageSize, params.sortBy, params.sortOrder],
    queryFn: async () => {
      const result = await getPaginatedColaboradoresAction(params);
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar colaboradores");
      }
      return result.data;
    },
    placeholderData: keepPreviousData,
  });
};
