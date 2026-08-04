import { useQuery } from "@tanstack/react-query";
import { getReporteHorasAgrupadoAction } from "../server/actions/getReporteHorasAgrupadoAction";
import type {
  ReporteAgrupadoPageDto,
  ReporteAgrupadoSort,
} from "../server/dtos/ReporteHorasAgrupadoDto.dto";
import type { ReporteHorasAgrupadoQueryState } from "../types/ReporteHorasAgrupadoFilters.type";

/**
 * TanStack Query hook: server-side paginated grouped report.
 * Query key reactivo a filters/page/pageSize/sort.
 */
export function useReporteHorasAgrupado(query: ReporteHorasAgrupadoQueryState) {
  const sort: ReporteAgrupadoSort | undefined = query.sort
    ? { field: query.sort.field, direction: query.sort.direction }
    : undefined;

  return useQuery<ReporteAgrupadoPageDto>({
    queryKey: [
      "reporte-horas-agrupado",
      query.filters,
      query.page,
      query.pageSize,
      query.sort,
    ],
    queryFn: async () => {
      const result = await getReporteHorasAgrupadoAction({
        filters: query.filters,
        page: query.page,
        pageSize: query.pageSize,
        sort,
      });
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
  });
}
