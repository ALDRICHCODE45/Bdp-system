export interface RegistroHorasAdvancedFilters {
  asuntoJuridicoIds: string[];
  socioIds: string[];
  ano?: number;
  semanaDesde?: number;
  semanaHasta?: number;
  horasMin: string;
  horasMax: string;
  fechaRegistroDesde: string;
  fechaRegistroHasta: string;
}

export const EMPTY_REGISTRO_HORAS_ADVANCED_FILTERS: RegistroHorasAdvancedFilters =
  {
    asuntoJuridicoIds: [],
    socioIds: [],
    ano: undefined,
    semanaDesde: undefined,
    semanaHasta: undefined,
    horasMin: "",
    horasMax: "",
    fechaRegistroDesde: "",
    fechaRegistroHasta: "",
  };

export function countActiveRegistroHorasAdvancedFilters(
  filters: RegistroHorasAdvancedFilters
): number {
  let count = 0;
  if (filters.asuntoJuridicoIds.length > 0) count++;
  if (filters.socioIds.length > 0) count++;
  if (
    filters.ano !== undefined ||
    filters.semanaDesde !== undefined ||
    filters.semanaHasta !== undefined
  ) {
    count++;
  }
  if (filters.horasMin || filters.horasMax) count++;
  if (filters.fechaRegistroDesde || filters.fechaRegistroHasta) count++;
  return count;
}
