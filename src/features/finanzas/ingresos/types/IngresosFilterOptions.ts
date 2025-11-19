export type EstadoIngresoFilter = "todos" | "pagado" | "pendiente" | "cancelado";

export type FormaPagoFilter = "todos" | "transferencia" | "efectivo" | "cheque";

export type FacturadoPorFilter =
  | "todos"
  | "bdp"
  | "calfc"
  | "global"
  | "rgz"
  | "rjs"
  | "app";

export interface MontoRangeFilter {
  min: number | null;
  max: number | null;
}

export interface FechaRangeFilter {
  desde: Date | null;
  hasta: Date | null;
}

export interface IngresosFilterOptions {
  searchQuery: string;
  estado: EstadoIngresoFilter;
  formaPago: FormaPagoFilter;
  facturadoPor: FacturadoPorFilter;
  montoRange: MontoRangeFilter;
  fechaRange: FechaRangeFilter;
}

