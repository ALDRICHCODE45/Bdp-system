import type { PaginationParams } from "@/core/shared/types/pagination.types";

export interface RegistroHorasFilterParams extends PaginationParams {
  equipoJuridicoId?: string;
  clienteJuridicoId?: string;
  asuntoJuridicoId?: string;
  socioId?: string;
  usuarioId?: string; // legacy single-value support

  equipoJuridicoIds?: string[];
  clienteJuridicoIds?: string[];
  asuntoJuridicoIds?: string[];
  socioIds?: string[];
  usuarioIds?: string[];

  ano?: number;
  semanaDesde?: number;
  semanaHasta?: number;
  horasMin?: number;
  horasMax?: number;
  fechaRegistroDesde?: string;
  fechaRegistroHasta?: string;
}
