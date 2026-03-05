export type DashboardPeriod = "month" | "quarter" | "year";

/** KPIs de una moneda específica */
export type CurrencyKpis = {
  moneda: string;
  totalFacturado: number;
  totalCobrado: number;
  totalPorCobrar: number;
  totalCancelado: number;
  cantidadFacturas: number;
  cantidadCanceladas: number;
  tasaCobro: number;
};

/** Datos de un mes en la serie temporal (filtrada a la moneda primaria) */
export type MonthlyDataPoint = {
  /** Etiqueta legible: "Ene", "Feb", etc. */
  label: string;
  /** Año-mes para ordenar: "2025-01" */
  key: string;
  /** Monto total facturado (createdAt en ese mes) */
  facturado: number;
  /** Monto cobrado (fechaPago en ese mes) */
  cobrado: number;
};

/** Cliente agrupado por monto facturado — una entrada por (cliente, moneda) */
export type TopClienteItem = {
  nombre: string;
  rfc: string;
  total: number;
  cantidadFacturas: number;
  moneda: string;
};

/** Factura reciente resumida */
export type RecentFacturaItem = {
  id: string;
  concepto: string;
  nombreReceptor: string | null;
  total: number;
  moneda: string;
  status: string;
  createdAt: string;
};

/** Payload completo del dashboard */
export type FacturasDashboardDto = {
  // ── KPIs por moneda ───────────────────────────────────────────────────────
  /** KPIs agrupados por moneda. La primera entrada es la moneda primaria (mayor volumen). */
  kpisByCurrency: CurrencyKpis[];

  /**
   * Moneda primaria del período — la de mayor volumen facturado.
   * Usada para filtrar la gráfica mensual y como referencia principal en KPIs.
   */
  primaryCurrency: string;

  // ── Breakdown por status (conteo, todas las monedas) ─────────────────────
  countVigente: number;
  countCancelada: number;

  // ── Serie mensual (moneda primaria únicamente) ────────────────────────────
  monthlySeries: MonthlyDataPoint[];

  // ── Top clientes (una entrada por cliente × moneda) ───────────────────────
  topClientes: TopClienteItem[];

  // ── Últimas facturas ──────────────────────────────────────────────────────
  recentFacturas: RecentFacturaItem[];

  // ── Meta ──────────────────────────────────────────────────────────────────
  period: DashboardPeriod;
  generatedAt: string;
};
