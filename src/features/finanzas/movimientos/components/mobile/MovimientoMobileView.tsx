"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  MoreHorizontal,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  CircleDollarSign,
} from "lucide-react";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import { Skeleton } from "@/core/shared/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/shared/ui/dropdown-menu";
import { cn } from "@/core/lib/utils";
import type { MovimientoFilterInput } from "../../server/actions/getMovimientosAction";
import type { MovimientoListDto } from "../../server/dtos/MovimientoListDto.dto";
import type { MovimientoAggregatesData } from "../MovimientoAggregates";
import { MovimientoMobileCard } from "./MovimientoMobileCard";
import { MovimientoMobileFiltersDrawer } from "./MovimientoMobileFiltersDrawer";

// ── Tabs config ───────────────────────────────────────────────────────────────
export type MovimientoMobileTab = "all" | "ingresos" | "egresos";

const TABS: {
  id: MovimientoMobileTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "all", label: "Todos", icon: CircleDollarSign },
  { id: "ingresos", label: "Ingresos", icon: ArrowUpCircle },
  { id: "egresos", label: "Egresos", icon: ArrowDownCircle },
];

// ── Formatters ────────────────────────────────────────────────────────────────
const MXN_FORMATTER = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const toAmount = (value: string | undefined): number => {
  const n = parseFloat(value ?? "");
  return Number.isNaN(n) ? 0 : n;
};

function countActiveFilters(f: MovimientoFilterInput): number {
  let count = 0;
  if ((f.estado?.length ?? 0) > 0) count++;
  if ((f.categoria?.length ?? 0) > 0) count++;
  if ((f.formaPago?.length ?? 0) > 0) count++;
  if ((f.cargoAbono?.length ?? 0) > 0) count++;
  if ((f.facturadoPor?.length ?? 0) > 0) count++;
  if ((f.titular?.length ?? 0) > 0) count++;
  if (f.fechaOperacionFrom || f.fechaOperacionTo) count++;
  if (f.fechaCorteFrom || f.fechaCorteTo) count++;
  if (f.montoMin != null || f.montoMax != null) count++;
  return count;
}

// ── MobileAggregates ──────────────────────────────────────────────────────────
function MobileAggregates({
  aggregates,
  isLoading,
  totalCount,
}: {
  aggregates: MovimientoAggregatesData;
  isLoading: boolean;
  totalCount: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const totalIngresos = toAmount(aggregates.totalIngresos);
  const totalEgresos = toAmount(aggregates.totalEgresos);
  const saldo = totalIngresos - totalEgresos;

  return (
    <div className="border-t bg-muted/20 px-4 py-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between w-full text-xs text-muted-foreground"
      >
        <span className="font-medium">
          Σ Totales ({totalCount.toLocaleString("es-MX")} movimientos)
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-3/4 rounded" />
            </>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span className="text-muted-foreground">
                Ingresos ({aggregates.countIngresos.toLocaleString("es-MX")}):
              </span>
              <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {MXN_FORMATTER.format(totalIngresos)}
              </span>
              <span className="text-muted-foreground">
                Egresos ({aggregates.countEgresos.toLocaleString("es-MX")}):
              </span>
              <span className="font-semibold tabular-nums text-red-600 dark:text-red-400">
                {MXN_FORMATTER.format(totalEgresos)}
              </span>
              <span className="text-muted-foreground">Saldo:</span>
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  saldo >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {MXN_FORMATTER.format(saldo)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm space-y-2.5">
      <div className="flex justify-between gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-2/3 rounded" />
      <Skeleton className="h-3 w-3/4 rounded" />
      <div className="flex justify-between pt-1">
        <Skeleton className="h-5 w-24 rounded" />
        <Skeleton className="h-7 w-7 rounded" />
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface MovimientoMobileViewProps {
  data: MovimientoListDto | undefined;
  isLoading: boolean;
  onCreateClick?: () => void;
  onImportClick?: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  // Paginación
  page: number;
  onPageChange: (page: number) => void;
  // Tabs (tipo de movimiento)
  activeTab: MovimientoMobileTab;
  onTabChange: (tab: MovimientoMobileTab) => void;
  // Búsqueda
  search: string;
  onSearchChange: (value: string) => void;
  // Filtros compartidos con desktop
  filters: MovimientoFilterInput;
  onApplyFilters: (filters: MovimientoFilterInput) => void;
  onClearFilters: () => void;
  titulares?: string[];
  // Aggregates
  aggregates?: MovimientoAggregatesData;
}

// ── Componente principal ──────────────────────────────────────────────────────
export function MovimientoMobileView({
  data,
  isLoading,
  onCreateClick,
  onImportClick,
  onView,
  onEdit,
  onDelete,
  page,
  onPageChange,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  filters,
  onApplyFilters,
  onClearFilters,
  titulares = [],
  aggregates,
}: MovimientoMobileViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFiltersCount = useMemo(
    () => countActiveFilters(filters),
    [filters],
  );

  const totalCount = data?.pagination.total ?? 0;
  const pageCount = Math.max(1, data?.pagination.totalPages ?? 1);
  const items = data?.data ?? [];

  const tabCount = (tab: MovimientoMobileTab): number => {
    if (!aggregates) return 0;
    if (tab === "all")
      return aggregates.countIngresos + aggregates.countEgresos;
    if (tab === "ingresos") return aggregates.countIngresos;
    return aggregates.countEgresos;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Header compacto ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
        <h1 className="text-lg font-semibold">Ingresos / Egresos</h1>
        <div className="flex items-center gap-2">
          {onCreateClick && (
            <Button
              size="icon"
              variant="default"
              className="size-8"
              onClick={onCreateClick}
            >
              <Plus className="size-4" />
              <span className="sr-only">Agregar movimiento</span>
            </Button>
          )}

          {onImportClick && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="size-8">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Más opciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={onImportClick}
                  className="gap-2 text-sm"
                >
                  Importar Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* ── Tabs de tipo ─────────────────────────────────────────────────── */}
      <div className="flex gap-1 px-4 py-2 overflow-x-auto scrollbar-none border-b">
        {TABS.map((tab) => {
          const count = tabCount(tab.id);
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="size-3" />
              {tab.label}
              {aggregates && (
                <span
                  className={cn(
                    "text-[10px] font-semibold",
                    isActive ? "opacity-90" : "opacity-70",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Search + botón Filtros ───────────────────────────────────────── */}
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
            activeFiltersCount > 0 && "border-primary text-primary",
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

      {/* ── Lista de cards ───────────────────────────────────────────────── */}
      <div className="flex-1 px-4 py-3 space-y-3">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
            <div className="text-4xl">💸</div>
            <p className="text-sm font-medium">Sin movimientos</p>
            <p className="text-xs">
              No hay movimientos que coincidan con los filtros activos.
            </p>
          </div>
        ) : (
          items.map((movimiento) => (
            <MovimientoMobileCard
              key={movimiento.id}
              movimiento={movimiento}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
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

      {/* ── Aggregates colapsables ───────────────────────────────────────── */}
      {aggregates && (
        <MobileAggregates
          aggregates={aggregates}
          isLoading={isLoading}
          totalCount={totalCount}
        />
      )}

      {/* ── Drawer de filtros ────────────────────────────────────────────── */}
      <MovimientoMobileFiltersDrawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onApply={onApplyFilters}
        onClearFilters={onClearFilters}
        titulares={titulares}
      />
    </div>
  );
}
