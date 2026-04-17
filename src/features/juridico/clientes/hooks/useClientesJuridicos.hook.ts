import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedClientesJuridicosAction } from "../server/actions/getPaginatedClientesJuridicosAction";
import type { ClientesJuridicosFilterParams } from "../types/ClientesJuridicosFilterParams";

export const useClientesJuridicos = (params: ClientesJuridicosFilterParams) => {
  return useQuery({
    queryKey: [
      "clientes-juridicos",
      "paginated",
      params.page,
      params.pageSize,
      params.sortBy,
      params.sortOrder,
      params.search,
    ],
    queryFn: async () => {
      const result = await getPaginatedClientesJuridicosAction(params);
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};
