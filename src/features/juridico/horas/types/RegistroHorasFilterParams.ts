import type { PaginationParams } from "@/core/shared/types/pagination.types";

export interface RegistroHorasFilterParams extends PaginationParams {
  equipoJuridicoId?: string;
  clienteJuridicoId?: string;
  asuntoJuridicoId?: string;
  socioId?: string;
  usuarioId?: string; // auto-set for non-admin
  ano?: number;
  semanaDesde?: number;
  semanaHasta?: number;
}
