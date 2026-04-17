import { useQuery } from "@tanstack/react-query";
import { getReporteHorasAction } from "../server/actions/getReporteHorasAction";
import type { ReporteHorasFilters } from "../server/dtos/ReporteHorasDto.dto";

export const useGetReporteHoras = (filters: ReporteHorasFilters) => {
  return useQuery({
    queryKey: ["reporte-horas", filters],
    queryFn: async () => {
      const result = await getReporteHorasAction(filters);
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
  });
};
