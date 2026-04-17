import type { PaginationParams } from "@/core/shared/types/pagination.types";

export interface EquiposJuridicosFilterParams extends PaginationParams {
  activo?: boolean;
}
