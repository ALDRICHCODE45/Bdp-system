export interface FacturasFilterParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: string;
  metodoPago?: string;
  moneda?: string;
  statusPago?: string;
}
