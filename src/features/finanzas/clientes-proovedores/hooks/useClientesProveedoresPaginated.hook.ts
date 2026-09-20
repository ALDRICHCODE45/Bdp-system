"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedClientesProveedoresAction } from "../server/actions/getPaginatedClientesProveedoresAction";
import type { ClientesProveedoresFilterParams } from "../types/ClientesProveedoresFilterParams";

export const useClientesProveedoresPaginated = (
  params: ClientesProveedoresFilterParams,
) => {
  return useQuery({
    queryKey: [
      "clientesProveedores",
      params.page,
      params.pageSize,
      params.sortBy,
      params.sortOrder,
      params.search,
      params.tipo,
      params.activo,
      params.banco,
      params.socioResponsable,
      params.fechaRegistroFrom,
      params.fechaRegistroTo,
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
