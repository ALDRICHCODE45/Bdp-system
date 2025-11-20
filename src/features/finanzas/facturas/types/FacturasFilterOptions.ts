export type EstadoFacturaFilter =
  | "todos"
  | "borrador"
  | "enviada"
  | "pagada"
  | "cancelada";

export type TipoOrigenFilter = "todos" | "ingreso" | "egreso";

export type FormaPagoFilter = "todos" | "transferencia" | "efectivo" | "cheque";

export interface MontoRangeFilter {
  min: number | null;
  max: number | null;
}

export interface FechaRangeFilter {
  desde: Date | null;
  hasta: Date | null;
}

export interface FacturasFilterOptions {
  searchQuery: string;
  estado: EstadoFacturaFilter;
  tipoOrigen: TipoOrigenFilter;
  formaPago: FormaPagoFilter;
  montoRange: MontoRangeFilter;
  fechaRange: FechaRangeFilter;
}

