"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedClientesProveedoresAction } from "../server/actions/getPaginatedClientesProveedoresAction";
import { PaginationParams } from "@/core/shared/types/pagination.types";

export const useClientesProveedoresPaginated = (params: PaginationParams) => {
  return useQuery({
    queryKey: [
      "clientesProveedores",
      params.page,
      params.pageSize,
      params.sortBy,
      params.sortOrder,
    ],
    queryFn: async () => {
      const result = await getPaginatedClientesProveedoresAction(params);
      if (!result.ok) {
        throw new Error(
          result.error || "Error al cargar clientes y proveedores"
        );
      }
      return result.data;
    },
    placeholderData: keepPreviousData,
  });
};
