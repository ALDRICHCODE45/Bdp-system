"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedUsersAction } from "../server/actions/getPaginatedUsersAction";
import { UserFilterParams } from "../types/filters/UserFilterParams";

export const useUsers = (params: UserFilterParams) => {
  return useQuery({
    queryKey: [
      "users",
      params.page,
      params.pageSize,
      params.sortBy,
      params.sortOrder,
      params.search,
      params.isActive,
    ],
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
