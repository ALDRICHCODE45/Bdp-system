// ─── Estado cliente para el reporte agrupado ─────────────────────────────────
// Espejo del server `ReporteAgrupadoFilters` + paginación + sort. Lo que el
// View manipula; al invocar las server actions se transforma y se valida con Zod.
// ──────────────────────────────────────────────────────────────────────────────

import type {
  ReporteAgrupadoFilters,
  ReporteAgrupadoSortField,
} from "../server/dtos/ReporteHorasAgrupadoDto.dto";

export type ReporteHorasAgrupadoFiltersState = ReporteAgrupadoFilters;

export type ReporteHorasAgrupadoSortState = {
  field: ReporteAgrupadoSortField;
  direction: "asc" | "desc";
};

export type ReporteHorasAgrupadoQueryState = {
  filters: ReporteHorasAgrupadoFiltersState;
  page: number;
  pageSize: number;
  sort?: ReporteHorasAgrupadoSortState;
};

export const EMPTY_REPORTE_HORAS_AGRUPADO_FILTERS: ReporteHorasAgrupadoFiltersState =
  {};
