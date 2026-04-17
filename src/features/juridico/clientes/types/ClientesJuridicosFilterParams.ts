import type { PaginationParams } from "@/core/shared/types/pagination.types";

export interface ClientesJuridicosFilterParams extends PaginationParams {
  activo?: boolean; // true by default
}
