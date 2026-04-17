import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedEquiposJuridicosAction } from "../server/actions/getPaginatedEquiposJuridicosAction";
import type { EquiposJuridicosFilterParams } from "../types/EquiposJuridicosFilterParams";

export const useEquiposJuridicos = (params: EquiposJuridicosFilterParams) => {
  return useQuery({
    queryKey: [
      "equipos-juridicos",
      "paginated",
      params.page,
      params.pageSize,
      params.sortBy,
      params.sortOrder,
      params.search,
    ],
    queryFn: async () => {
      const result = await getPaginatedEquiposJuridicosAction(params);
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};
