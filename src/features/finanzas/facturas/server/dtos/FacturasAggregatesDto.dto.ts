/** Agregados numéricos de facturas agrupados por moneda — server → client */
export type FacturaAggregateCurrencyDto = {
  moneda: string;
  /** Cantidad de facturas que aportan a esta moneda */
  count: number;
  total: number;
  subtotal: number;
  totalImpuestosTransladados: number | null;
  totalImpuestosRetenidos: number | null;
};

export type FacturasAggregatesDto = {
  /** Total de registros que pasan el filtro actual (suma de counts de todas las monedas) */
  totalCount: number;
  /** Una entrada por cada moneda distinta presente en los resultados filtrados */
  byCurrency: FacturaAggregateCurrencyDto[];
};
