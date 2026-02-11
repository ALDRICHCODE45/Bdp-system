"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedUsersAction } from "../server/actions/getPaginatedUsersAction";
import { PaginationParams } from "@/core/shared/types/pagination.types";

export const useUsers = (params: PaginationParams) => {
  return useQuery({
    queryKey: ["users", params.page, params.pageSize, params.sortBy, params.sortOrder],
    queryFn: async () => {
      const result = await getPaginatedUsersAction(params);
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar usuarios");
      }
      return result.data;
    },
    placeholderData: keepPreviousData,
  });
};
