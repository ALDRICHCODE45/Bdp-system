import type { PaginationParams } from "@/core/shared/types/pagination.types";

export interface UserFilterParams extends PaginationParams {
  isActive?: boolean;
}
