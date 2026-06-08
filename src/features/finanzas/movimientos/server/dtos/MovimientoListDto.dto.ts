import type { MovimientoDto } from "./MovimientoDto.dto";

/**
 * DTO for paginated movimientos list with aggregates.
 * Slimmer than MovimientoDto — omits notas and descripcionAdministracion
 * for payload size, but shares the same shape for simplicity.
 */
export type MovimientoListItemDto = Omit<
  MovimientoDto,
  "notas" | "descripcionAdministracion"
>;

export type MovimientoListDto = {
  data: MovimientoListItemDto[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  aggregates: {
    totalIngresos: string;
    totalEgresos: string;
    count: number;
  };
};
