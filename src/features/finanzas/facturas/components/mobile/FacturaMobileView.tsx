"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  MoreHorizontal,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  XCircle,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/core/shared/ui/button";
import { Badge } from "@/core/shared/ui/badge";
import { Skeleton } from "@/core/shared/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/shared/ui/dropdown-menu";
import { Input } from "@/core/shared/ui/input";
import { cn } from "@/core/lib/utils";
import type { PaginatedResult } from "@/core/shared/types/pagination.types";
import type { FacturaDto } from "../../server/dtos/FacturaDto.dto";
import type { FacturasAggregatesDto } from "../../server/dtos/FacturasAggregatesDto.dto";
import type { FacturaStatusCounts } from "../../server/actions/getFacturaStatusCountsAction";
import { FacturaMobileCard } from "./FacturaMobileCard";
import { FacturaMobileFiltersDrawer } from "./FacturaMobileFiltersDrawer";
import { getCurrencyFormatter } from "../FacturasTableColumns";

// ── Tabs config ───────────────────────────────────────────────────────────────
type StatusTab = "all" | "vigente" | "cancelada";

const STATUS_TABS: {
  id: StatusTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  statusValue: string | null;
}[] = [
  { id: "all", label: "Todos", icon: LayoutGrid, statusValue: null },
  { id: "vigente", label: "Vigente", icon: CheckCircle2, statusValue: "vigente" },
  { id: "cancelada", label: "Cancelada", icon: XCircle, statusValue: "cancelada" },
];

// ── MobileAggregates ──────────────────────────────────────────────────────────
function MobileAggregates({
  aggregates,
}: {
  aggregates: FacturasAggregatesDto;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!aggregates.byCurrency.length) return null;

  return (
    <div className="border-t bg-muted/20 px-4 py-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between w-full text-xs text-muted-foreground"
      >
        <span className="font-medium">
          Σ Totales ({aggregates.totalCount.toLocaleString("es-MX")} facturas)
        </span>
        <ChevronRight
          className={cn(
            "size-3.5 transition-transform",
            expanded && "rotate-90"
          )}
        />
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {aggregates.byCurrency.map((row) => {
            const fmt = getCurrencyFormatter(row.moneda);
            return (
              <div key={row.moneda} className="flex flex-col gap-1">
                <Badge
                  variant="outline"
                  className="font-mono text-xs w-fit h-5 px-1.5"
                >
                  {row.moneda}
                </Badge>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold tabular-nums">
                    {fmt.format(row.total)}
                  </span>
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="tabular-nums">{fmt.format(row.subtotal)}</span>
                  {row.totalImpuestosTransladados != null &&
                    row.totalImpuestosTransladados !== 0 && (
                      <>
                        <span className="text-muted-foreground">
                          Imp. Trasladados:
                        </span>
                        <span className="tabular-nums">
                          {fmt.format(row.totalImpuestosTransladados)}
                        </span>
                      </>
                    )}
                  {row.totalImpuestosRetenidos != null &&
                    row.totalImpuestosRetenidos !== 0 && (
                      <>
                        <span className="text-muted-foreground">
                          Imp. Retenidos:
                        </span>
                        <span className="tabular-nums">
                          {fmt.format(row.totalImpuestosRetenidos)}
                        </span>
                      </>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Skeleton loaders ──────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm space-y-2.5">
      <div className="flex justify-between gap-2">
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-3/4 rounded" />
      <div className="flex justify-between pt-1">
        <Skeleton className="h-5 w-24 rounded" />
        <Skeleton className="h-7 w-7 rounded" />
      </div>
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────
interface FacturaMobileViewProps {
  data: PaginatedResult<FacturaDto> | undefined;
  isLoading: boolean;
  isCapturador?: boolean;
  currentUserId?: string;
  onCreateClick: () => void;
  onViewDetail: (factura: FacturaDto) => void;
  onImportClick?: () => void;
  // Paginación
  page: number;
  onPageChange: (page: number) => void;
  // Filtro de status (tab activo)
  statusFilter: StatusTab;
  onStatusFilterChange: (status: StatusTab) => void;
  // Filtros rápidos
  metodoPago: string[];
  onMetodoPagoChange: (v: string[]) => void;
  medioPago: string[];
  onMedioPagoChange: (v: string[]) => void;
  moneda: string[];
  onMonedaChange: (v: string[]) => void;
  statusPago: string[];
  onStatusPagoChange: (v: string[]) => void;
  onClearFilters: () => void;
  // Búsqueda
  search: string;
  onSearchChange: (v: string) => void;
  // Aggregates & counts
  aggregates?: FacturasAggregatesDto;
  statusCounts?: FacturaStatusCounts;
}

// ── Componente principal ──────────────────────────────────────────────────────
export function FacturaMobileView({
  data,
  isLoading,
  isCapturador = false,
  currentUserId,
  onCreateClick,
  onViewDetail,
  onImportClick,
  page,
  onPageChange,
  statusFilter,
  onStatusFilterChange,
  metodoPago,
  onMetodoPagoChange,
  medioPago,
  onMedioPagoChange,
  moneda,
  onMonedaChange,
  statusPago,
  onStatusPagoChange,
  onClearFilters,
  search,
  onSearchChange,
  aggregates,
  statusCounts,
}: FacturaMobileViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFiltersCount = useMemo(
    () =>
      (metodoPago.length > 0 ? 1 : 0) +
      (medioPago.length > 0 ? 1 : 0) +
      (moneda.length > 0 ? 1 : 0) +
      (statusPago.length > 0 ? 1 : 0),
    [metodoPago, medioPago, moneda, statusPago]
  );

  const totalCount = data?.totalCount ?? 0;
  const pageCount = data?.pageCount ?? 1;

  // Conteo para los tabs
  const tabCount = (tab: StatusTab): number | undefined => {
    if (!statusCounts) return undefined;
    if (tab === "all") return statusCounts.vigente + statusCounts.cancelada;
    return statusCounts[tab];
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Header compacto ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
        <h1 className="text-lg font-semibold">Facturas</h1>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="default" className="size-8" onClick={onCreateClick}>
            <Plus className="size-4" />
            <span className="sr-only">Crear factura</span>
          </Button>

          {!isCapturador && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="size-8">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Más opciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {onImportClick && (
                  <DropdownMenuItem onClick={onImportClick} className="gap-2 text-sm">
                    Importar Excel
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* ── Status tabs — ocultos para capturador ────────────────────────── */}
      {!isCapturador && (
        <div className="flex gap-1 px-4 py-2 overflow-x-auto scrollbar-none border-b">
          {STATUS_TABS.map((tab) => {
            const count = tabCount(tab.id);
            const isActive = statusFilter === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onStatusFilterChange(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="size-3" />
                {tab.label}
                {count !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] font-semibold",
                      isActive ? "opacity-90" : "opacity-70"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Search + botón Filtros — oculto para capturador ─────────────── */}
      {!isCapturador && (
        <div className="flex items-center gap-2 px-4 py-2 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar..."
              className="pl-8 h-8 text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "shrink-0 gap-1.5 h-8",
              activeFiltersCount > 0 && "border-primary text-primary"
            )}
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal className="size-3.5" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge className="ml-0.5 size-4 p-0 flex items-center justify-center text-[10px]">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      )}

      {/* ── Lista de cards ────────────────────────────────────────────────── */}
      <div className="flex-1 px-4 py-3 space-y-3">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : !data || data.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
            <div className="text-4xl">📄</div>
            <p className="text-sm font-medium">Sin facturas</p>
            <p className="text-xs">
              No hay facturas que coincidan con los filtros activos.
            </p>
          </div>
        ) : (
          data.data.map((factura) => (
            <FacturaMobileCard
              key={factura.id}
              factura={factura}
              isCapturador={isCapturador}
              currentUserId={currentUserId}
              onViewDetail={onViewDetail}
            />
          ))
        )}
      </div>

      {/* ── Paginación compacta — sticky bottom ──────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-background sticky bottom-0 z-10">
        <span className="text-xs text-muted-foreground">
          {totalCount.toLocaleString("es-MX")} resultados
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Página anterior</span>
          </Button>
          <span className="text-sm px-2 min-w-[3rem] text-center">
            {page} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Página siguiente</span>
          </Button>
        </div>
      </div>

      {/* ── Aggregates colapsables ────────────────────────────────────────── */}
      {aggregates && <MobileAggregates aggregates={aggregates} />}

      {/* ── Drawer de filtros ─────────────────────────────────────────────── */}
      {!isCapturador && (
        <FacturaMobileFiltersDrawer
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          metodoPago={metodoPago}
          onMetodoPagoChange={onMetodoPagoChange}
          medioPago={medioPago}
          onMedioPagoChange={onMedioPagoChange}
          moneda={moneda}
          onMonedaChange={onMonedaChange}
          statusPago={statusPago}
          onStatusPagoChange={onStatusPagoChange}
          onClearFilters={onClearFilters}
        />
      )}
    </div>
  );
}
