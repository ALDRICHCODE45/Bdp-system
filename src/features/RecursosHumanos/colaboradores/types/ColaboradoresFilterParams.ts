import type { PaginationParams } from "@/core/shared/types/pagination.types";

/**
 * Filter params for the colaboradores paginated query.
 *
 * Extends `PaginationParams` with:
 * - status?: ColaboradorEstado[] (single-value per tab; multi for future-proofing)
 * - search?: string (case-insensitive contains over name + correo + puesto)
 */
export type ColaboradorEstadoFilter =
  | "CONTRATADO"
  | "DESPEDIDO"
  | "EN_LICENCIA";

export interface ColaboradoresFilterParams extends PaginationParams {
  status?: ColaboradorEstadoFilter[];
  search?: string;
}