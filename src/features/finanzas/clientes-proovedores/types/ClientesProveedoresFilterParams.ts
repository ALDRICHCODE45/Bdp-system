import type { PaginationParams } from "@/core/shared/types/pagination.types";

/**
 * Server-side filter contract for Clientes/Proveedores pagination.
 *
 * Extends the shared pagination params so the repository, service and action
 * receive one typed object. Date fields are `yyyy-MM-dd` strings; the
 * repository treats them as inclusive full-day boundaries (start/end of day).
 */
export interface ClientesProveedoresFilterParams extends PaginationParams {
  /** Global search over nombre, rfc, email, contacto and banco. */
  tipo?: "CLIENTE" | "PROVEEDOR";
  /** Maps the UI "estado" filter (activo/inactivo). */
  activo?: boolean;
  /** Exact bank match. */
  banco?: string;
  /** Free-text search over the responsible socio name. */
  socioResponsable?: string;
  /** Inclusive lower bound for fechaRegistro (yyyy-MM-dd). */
  fechaRegistroFrom?: string;
  /** Inclusive upper bound for fechaRegistro (yyyy-MM-dd). */
  fechaRegistroTo?: string;
}
