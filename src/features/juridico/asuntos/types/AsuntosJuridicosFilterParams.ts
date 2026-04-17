import type { PaginationParams } from "@/core/shared/types/pagination.types";

export interface AsuntosJuridicosFilterParams extends PaginationParams {
  estado?: string[]; // ["ACTIVO", "INACTIVO", "CERRADO"] — multi-select for tabs
  clienteJuridicoId?: string;
}
