import { useMutation } from "@tanstack/react-query";
import { getHorasAgrupadasExportAction } from "../server/actions/getHorasAgrupadasExportAction";
import type { ReporteGrupoDto } from "../server/dtos/ReporteHorasAgrupadoDto.dto";
import type { ReporteHorasAgrupadoFiltersState } from "../types/ReporteHorasAgrupadoFilters.type";

/**
 * TanStack Query mutation hook: trae TODOS los grupos que cumplen los filtros
 * (sin paginación). Lo consume el botón "Exportar Excel" / "Exportar PDF".
 */
export function useExportHorasAgrupadas() {
  return useMutation<ReporteGrupoDto[], Error, ReporteHorasAgrupadoFiltersState>({
    mutationFn: async (filters) => {
      const result = await getHorasAgrupadasExportAction({ filters });
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
  });
}
