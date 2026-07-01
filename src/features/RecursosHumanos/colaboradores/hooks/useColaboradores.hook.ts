"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedColaboradoresAction } from "../server/actions/getPaginatedColaboradoresAction";
import type { ColaboradoresFilterParams } from "../types/ColaboradoresFilterParams";

/**
 * Paginated colaboradores query (server-side filter + pagination).
 *
 * Accepts the full ColaboradoresFilterParams (page, pageSize, sortBy, sortOrder,
 * status, search). Query key includes every filter field so cache invalidates
 * on any change.
 */
export const useColaboradores = (params: ColaboradoresFilterParams) => {
  return useQuery({
    queryKey: [
      "colaboradores",
      params.page,
      params.pageSize,
      params.sortBy,
      params.sortOrder,
      params.status,
      params.search,
    ],
    queryFn: async () => {
      const result = await getPaginatedColaboradoresAction(params);
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar colaboradores");
      }
      return result.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};