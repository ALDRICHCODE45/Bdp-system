"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedRolesAction } from "../server/actions/getPaginatedRolesAction";
import { PaginationParams } from "@/core/shared/types/pagination.types";

export const useRolesPaginated = (params: PaginationParams) => {
  return useQuery({
    queryKey: ["roles", params.page, params.pageSize, params.sortBy, params.sortOrder],
    queryFn: async () => {
      const result = await getPaginatedRolesAction(params);
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar roles");
      }
      return result.data;
    },
    placeholderData: keepPreviousData,
  });
};
