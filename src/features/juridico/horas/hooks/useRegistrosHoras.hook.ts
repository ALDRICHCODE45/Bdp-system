import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPaginatedRegistrosHorasAction } from "../server/actions/getPaginatedRegistrosHorasAction";
import type { RegistroHorasFilterParams } from "../types/RegistroHorasFilterParams";

export const useRegistrosHoras = (params: RegistroHorasFilterParams) => {
  return useQuery({
    queryKey: [
      "registros-horas",
      "paginated",
      params.page,
      params.pageSize,
      params.sortBy,
      params.sortOrder,
      params.search,
      params.equipoJuridicoId,
      params.clienteJuridicoId,
      params.asuntoJuridicoId,
      params.socioId,
      params.usuarioId,
      params.ano,
      params.semanaDesde,
      params.semanaHasta,
    ],
    queryFn: async () => {
      const result = await getPaginatedRegistrosHorasAction(params);
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};
