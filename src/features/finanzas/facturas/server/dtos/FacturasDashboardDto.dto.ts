export type DashboardPeriod = "month" | "quarter" | "year";

/** Datos de un mes en la serie temporal */
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

/** Cliente agrupado por monto facturado */
export type TopClienteItem = {
  nombre: string;
  rfc: string;
  total: number;
  cantidadFacturas: number;
};

/** Factura reciente resumida */
export type RecentFacturaItem = {
  id: string;
  concepto: string;
  nombreReceptor: string | null;
  total: number;
  status: string;
  createdAt: string;
};

/** Payload completo del dashboard */
export type FacturasDashboardDto = {
  // ── KPIs ────────────────────────────────────────────────────────────────
  /** Total facturado en el período (status != CANCELADA) */
  totalFacturado: number;
  /** Total cobrado en el período (status = PAGADA) */
  totalCobrado: number;
  /** Total por cobrar (status = ENVIADA, sin importar período de emisión) */
  totalPorCobrar: number;
  /** Cantidad de facturas en el período (status != CANCELADA) */
  cantidadFacturas: number;
  /** Cantidad de facturas canceladas en el período */
  cantidadCanceladas: number;
  /** Tasa de cobro 0-100 */
  tasaCobro: number;

  // ── Breakdown por status (conteo) ─────────────────────────────────────
  countBorrador: number;
  countEnviada: number;
  countPagada: number;
  countCancelada: number;
  /** Sum of total for CANCELADA facturas in the period */
  totalCancelado: number;
  /** Count of BORRADOR facturas in the period */
  countBorradorTotal: number;

  // ── Serie mensual (últimos N meses según período) ─────────────────────
  monthlySeries: MonthlyDataPoint[];

  // ── Top 5 clientes ────────────────────────────────────────────────────
  topClientes: TopClienteItem[];

  // ── Últimas facturas ──────────────────────────────────────────────────
  recentFacturas: RecentFacturaItem[];

  // ── Meta ──────────────────────────────────────────────────────────────
  period: DashboardPeriod;
  generatedAt: string;
};
