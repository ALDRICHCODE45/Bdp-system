"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/core/lib/utils";
import { Skeleton } from "@/core/shared/ui/skeleton";
import { Badge } from "@/core/shared/ui/badge";
import { useFacturasDashboard } from "../hooks/useFacturasDashboard.hook";
import type {
  CurrencyKpis,
  DashboardPeriod,
} from "../server/dtos/FacturasDashboardDto.dto";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";

// ─── Formatters ───────────────────────────────────────────────────────────────

/** Cache de formatters por moneda para no recrearlos en cada render */
const fmtCache = new Map<string, Intl.NumberFormat>();
function getFmt(currency: string) {
  if (!fmtCache.has(currency)) {
    fmtCache.set(
      currency,
      new Intl.NumberFormat("es-MX", { style: "currency", currency, minimumFractionDigits: 2 })
    );
  }
  return fmtCache.get(currency)!;
}

function fmtShort(v: number, currency = "MXN"): string {
  const prefix = currency === "MXN" ? "$" : currency === "USD" ? "USD " : currency + " ";
  if (v >= 1_000_000) return `${prefix}${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${prefix}${(v / 1_000).toFixed(0)}k`;
  return getFmt(currency).format(v);
}

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  month:   "Este mes",
  quarter: "Últimos 3 meses",
  year:    "Este año",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return (
    name.split(" ").slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase() || "?"
  );
}

function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "d MMM yyyy", { locale: es });
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function ClientAvatar({ initials, colorIdx }: { initials: string; colorIdx: number }) {
  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
    "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  ];
  return (
    <div className={cn("size-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0", colors[colorIdx % colors.length])}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAGADA:    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    ENVIADA:   "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    CANCELADA: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    BORRADOR:  "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400",
  };
  const labels: Record<string, string> = {
    PAGADA: "PAGADA", ENVIADA: "PENDIENTE", CANCELADA: "CANCELADA", BORRADOR: "BORRADOR",
  };
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0", styles[status] ?? styles["BORRADOR"])}>
      {labels[status] ?? status}
    </span>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500">
      <span className="size-2 rounded-full shrink-0" style={{ background: color }} />
      {label}
    </span>
  );
}

function ChartTooltip({
  active, payload, label, currency,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  currency?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg px-4 py-3 text-sm space-y-1.5">
      <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-xs">
            <span className="size-2 rounded-full shrink-0" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-bold text-slate-800 dark:text-zinc-100 tabular-nums text-xs">
            {fmtShort(p.value, currency)}
          </span>
        </div>
      ))}
    </div>
  );
}

function KpiCard({
  label, value, sub, icon, danger,
}: {
  label: string; value: string; sub?: string; icon: React.ReactNode; danger?: boolean;
}) {
  return (
    <div className={cn(
      "bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 px-5 py-5",
      danger && "border-l-4 border-l-red-400"
    )}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{label}</p>
        {icon}
      </div>
      <p className={cn(
        "text-[1.75rem] font-bold tabular-nums leading-tight",
        danger ? "text-red-500 dark:text-red-400" : "text-slate-800 dark:text-zinc-100"
      )}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1.5">{sub}</p>}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 px-5 py-5 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-3 w-24 bg-slate-100 dark:bg-zinc-800" />
        <Skeleton className="h-5 w-5 rounded bg-slate-100 dark:bg-zinc-800" />
      </div>
      <Skeleton className="h-8 w-32 bg-slate-100 dark:bg-zinc-800" />
      <Skeleton className="h-3 w-20 bg-slate-100 dark:bg-zinc-800" />
    </div>
  );
}

/** Fila compacta de KPIs secundarios para monedas adicionales */
function SecondaryKpiRow({ kpis }: { kpis: CurrencyKpis }) {
  return (
    <div className="flex items-center gap-4 flex-wrap rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 px-4 py-3 text-sm">
      <Badge variant="outline" className="font-mono text-xs shrink-0">{kpis.moneda}</Badge>
      <span className="text-slate-500 dark:text-zinc-400 text-xs">
        Facturado: <span className="font-semibold text-slate-700 dark:text-zinc-200">{getFmt(kpis.moneda).format(kpis.totalFacturado)}</span>
      </span>
      <span className="text-slate-500 dark:text-zinc-400 text-xs">
        Cobrado: <span className="font-semibold text-slate-700 dark:text-zinc-200">{getFmt(kpis.moneda).format(kpis.totalCobrado)}</span>
      </span>
      <span className="text-slate-500 dark:text-zinc-400 text-xs">
        Por cobrar: <span className="font-semibold text-slate-700 dark:text-zinc-200">{getFmt(kpis.moneda).format(kpis.totalPorCobrar)}</span>
      </span>
      <span className="text-slate-500 dark:text-zinc-400 text-xs">
        Cancelado: <span className="font-semibold text-red-500 dark:text-red-400">{getFmt(kpis.moneda).format(kpis.totalCancelado)}</span>
      </span>
      <span className="ml-auto text-xs text-slate-400 dark:text-zinc-500">
        {kpis.cantidadFacturas} factura{kpis.cantidadFacturas !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function FacturasDashboardView() {
  const [period, setPeriod] = useState<DashboardPeriod>("month");
  const { data, isLoading, isError, error } = useFacturasDashboard(period);

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const axisTickColor  = isDark ? "#71717a" : "#94a3b8";
  const gridColor      = isDark ? "#27272a" : "#f1f5f9";
  const cobradoBarColor = isDark ? "#1e3a5f" : "#bfdbfe";

  // KPIs de la moneda primaria
  const primaryKpis = data?.kpisByCurrency[0];
  // Monedas secundarias (el resto)
  const secondaryKpis = data?.kpisByCurrency.slice(1) ?? [];
  const primaryCurrency = data?.primaryCurrency ?? "MXN";

  return (
    <div className="space-y-4">

      {/* ── Period selector ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-0.5 rounded-xl border border-slate-100 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 p-1">
          {(Object.keys(PERIOD_LABELS) as DashboardPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-150",
                period === p
                  ? "bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 shadow-sm"
                  : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
              )}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {isError && (
        <div className="rounded-2xl border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 px-5 py-3 flex items-center gap-3">
          <AlertCircle className="size-4 text-rose-400 dark:text-rose-500 shrink-0" />
          <p className="text-sm text-rose-600 dark:text-rose-400">
            {error instanceof Error ? error.message : "Error al cargar el dashboard"}
          </p>
        </div>
      )}

      {/* ── KPI row — moneda primaria ─────────────────────────────────────── */}
      <div>
        {/* Label de moneda primaria si hay más de una */}
        {!isLoading && secondaryKpis.length > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="font-mono text-xs">{primaryCurrency}</Badge>
            <span className="text-xs text-muted-foreground">Moneda principal del período</span>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          ) : primaryKpis ? (
            <>
              <KpiCard
                label="Total Facturado"
                value={fmtShort(primaryKpis.totalFacturado, primaryCurrency)}
                sub={`${primaryKpis.cantidadFacturas} factura${primaryKpis.cantidadFacturas !== 1 ? "s" : ""} en el período`}
                icon={<FileText className="size-5 text-slate-400 dark:text-zinc-500" />}
              />
              <KpiCard
                label="Por Cobrar"
                value={fmtShort(primaryKpis.totalPorCobrar, primaryCurrency)}
                sub="Deuda global · no se filtra por período"
                icon={<Clock className="size-5 text-amber-400" />}
              />
              <KpiCard
                label="Cobrado"
                value={fmtShort(primaryKpis.totalCobrado, primaryCurrency)}
                sub={`${data?.countPagada ?? 0} factura${(data?.countPagada ?? 0) !== 1 ? "s" : ""} pagada${(data?.countPagada ?? 0) !== 1 ? "s" : ""}`}
                icon={<CheckCircle2 className="size-5 text-emerald-500" />}
              />
              <KpiCard
                label="Canceladas"
                value={fmtShort(primaryKpis.totalCancelado, primaryCurrency)}
                sub={`${data?.countCancelada ?? 0} cancelada${(data?.countCancelada ?? 0) !== 1 ? "s" : ""} en el período`}
                icon={<AlertTriangle className="size-5 text-red-400" />}
                danger
              />
            </>
          ) : null}
        </div>
      </div>

      {/* ── KPIs secundarios (otras monedas) ─────────────────────────────── */}
      {!isLoading && secondaryKpis.length > 0 && (
        <div className="space-y-2">
          {secondaryKpis.map((kpis) => (
            <SecondaryKpiRow key={kpis.moneda} kpis={kpis} />
          ))}
        </div>
      )}

      {/* ── Bar Chart ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 px-6 py-5">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100">
              Tendencia de facturación
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-slate-400 dark:text-zinc-500">
                Comparación mensual entre facturado y cobrado
              </p>
              {/* Badge que indica a qué moneda corresponde el gráfico */}
              <Badge variant="outline" className="font-mono text-xs h-4">
                {primaryCurrency}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <LegendDot color="#2563eb" label="Facturado" />
            <LegendDot color={cobradoBarColor} label="Cobrado" />
            {primaryKpis && (
              <div className="flex items-center gap-1.5 pl-4 border-l border-slate-100 dark:border-zinc-700">
                <span className="text-xs text-slate-400 dark:text-zinc-500">Tasa de cobro</span>
                <span className={cn(
                  "text-xs font-bold tabular-nums px-2 py-0.5 rounded-full",
                  primaryKpis.tasaCobro >= 80
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : primaryKpis.tasaCobro >= 50
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                    : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                )}>
                  {primaryKpis.tasaCobro}%
                </span>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-60 w-full rounded-xl bg-slate-100 dark:bg-zinc-800" />
        ) : data ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data.monthlySeries}
              margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
              barGap={4}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: axisTickColor }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(v) => fmtShort(v, primaryCurrency)}
                tick={{ fontSize: 11, fill: axisTickColor }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                content={<ChartTooltip currency={primaryCurrency} />}
                cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
              />
              <Bar dataKey="facturado" name="Facturado" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={18} />
              <Bar dataKey="cobrado" name="Cobrado" fill={cobradoBarColor} radius={[4, 4, 0, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </div>

      {/* ── Bottom 2-col section ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top Clients */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Top clientes</h3>
          </div>

          {isLoading ? (
            <div className="divide-y divide-slate-50 dark:divide-zinc-800">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <Skeleton className="size-9 rounded-full bg-slate-100 dark:bg-zinc-800 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-32 bg-slate-100 dark:bg-zinc-800" />
                    <Skeleton className="h-2.5 w-20 bg-slate-100 dark:bg-zinc-800" />
                  </div>
                  <Skeleton className="h-3 w-14 bg-slate-100 dark:bg-zinc-800" />
                </div>
              ))}
            </div>
          ) : data && data.topClientes.length > 0 ? (
            <div className="divide-y divide-slate-50 dark:divide-zinc-800">
              {data.topClientes.map((cliente, idx) => (
                <div
                  key={`${cliente.rfc}-${cliente.moneda}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <ClientAvatar initials={getInitials(cliente.nombre)} colorIdx={idx} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200 truncate">
                      {cliente.nombre}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">
                      {cliente.cantidadFacturas} factura{cliente.cantidadFacturas !== 1 ? "s" : ""} · {getFmt(cliente.moneda).format(cliente.total)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Badge de moneda — clave para distinguir MXN vs USD */}
                    <Badge variant="outline" className="font-mono text-xs h-5">
                      {cliente.moneda}
                    </Badge>
                    <span className="text-sm font-bold text-slate-800 dark:text-zinc-100 tabular-nums">
                      {fmtShort(cliente.total, cliente.moneda)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-sm text-slate-400 dark:text-zinc-500 text-center">
              Sin datos en el período seleccionado
            </p>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Facturas recientes</h3>
          </div>

          {isLoading ? (
            <div className="divide-y divide-slate-50 dark:divide-zinc-800">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-36 bg-slate-100 dark:bg-zinc-800" />
                    <Skeleton className="h-2.5 w-24 bg-slate-100 dark:bg-zinc-800" />
                  </div>
                  <Skeleton className="h-3 w-14 bg-slate-100 dark:bg-zinc-800 shrink-0" />
                  <Skeleton className="h-5 w-16 rounded-full bg-slate-100 dark:bg-zinc-800 shrink-0" />
                </div>
              ))}
            </div>
          ) : data && data.recentFacturas.length > 0 ? (
            <div className="divide-y divide-slate-50 dark:divide-zinc-800">
              {data.recentFacturas.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200 truncate">
                      {f.concepto}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">
                      {f.nombreReceptor ?? "—"} · {formatDate(f.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Badge de moneda en facturas recientes */}
                    <Badge variant="outline" className="font-mono text-xs h-5">
                      {f.moneda}
                    </Badge>
                    <span className="text-sm font-bold text-slate-800 dark:text-zinc-100 tabular-nums">
                      {fmtShort(f.total, f.moneda)}
                    </span>
                  </div>
                  <StatusBadge status={f.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-sm text-slate-400 dark:text-zinc-500 text-center">
              No hay facturas registradas
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
