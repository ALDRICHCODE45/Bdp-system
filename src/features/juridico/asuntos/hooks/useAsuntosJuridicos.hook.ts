import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedAsuntosJuridicosAction } from "../server/actions/getPaginatedAsuntosJuridicosAction";
import type { AsuntosJuridicosFilterParams } from "../types/AsuntosJuridicosFilterParams";

export const useAsuntosJuridicos = (params: AsuntosJuridicosFilterParams) => {
  return useQuery({
    queryKey: [
      "asuntos-juridicos",
      "paginated",
      params.page,
      params.pageSize,
      params.sortBy,
      params.sortOrder,
      params.search,
      params.estado,
      params.clienteJuridicoId,
    ],
    queryFn: async () => {
      const result = await getPaginatedAsuntosJuridicosAction(params);
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};
