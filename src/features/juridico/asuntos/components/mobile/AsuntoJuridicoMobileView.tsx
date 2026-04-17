"use client";

import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/core/shared/ui/button";
import { Badge } from "@/core/shared/ui/badge";
import { Skeleton } from "@/core/shared/ui/skeleton";
import { Input } from "@/core/shared/ui/input";
import { cn } from "@/core/lib/utils";
import type { PaginatedResult } from "@/core/shared/types/pagination.types";
import type { AsuntoJuridicoDto } from "../../server/dtos/AsuntoJuridicoDto.dto";
import { AsuntoJuridicoMobileCard } from "./AsuntoJuridicoMobileCard";
import { AsuntoJuridicoMobileFiltersDrawer } from "./AsuntoJuridicoMobileFiltersDrawer";

// ── Status tabs config ────────────────────────────────────────────────────────
const STATUS_TABS = [
  { label: "Todos", value: [] as string[] },
  { label: "Activo", value: ["ACTIVO"] },
  { label: "Inactivo", value: ["INACTIVO"] },
  { label: "Cerrado", value: ["CERRADO"] },
] as const;

// ── Skeleton loaders ──────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm space-y-2.5">
      <div className="flex justify-between gap-2">
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-3 w-1/2 rounded" />
      <Skeleton className="h-3 w-3/4 rounded" />
      <div className="flex justify-end pt-1">
        <Skeleton className="h-7 w-7 rounded" />
      </div>
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────
interface AsuntoJuridicoMobileViewProps {
  data: PaginatedResult<AsuntoJuridicoDto> | undefined;
  isLoading: boolean;
  onCreateClick: () => void;
  onViewDetail: (asunto: AsuntoJuridicoDto) => void;
  // Paginación
  page: number;
  onPageChange: (page: number) => void;
  // Búsqueda
  search: string;
  onSearchChange: (v: string) => void;
  // Estado filter
  estado: string[];
  onEstadoChange: (estado: string[]) => void;
  onClearFilters: () => void;
}

// ── Componente principal ──────────────────────────────────────────────────────
export function AsuntoJuridicoMobileView({
  data,
  isLoading,
  onCreateClick,
  onViewDetail,
  page,
  onPageChange,
  search,
  onSearchChange,
  estado,
  onEstadoChange,
  onClearFilters,
}: AsuntoJuridicoMobileViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const totalCount = data?.totalCount ?? 0;
  const pageCount = data?.pageCount ?? 1;

  const activeFiltersCount =
    (search.length > 0 ? 1 : 0) + (estado.length > 0 ? 1 : 0);

  // Determine the active tab (for highlighting)
  const activeTabIndex = STATUS_TABS.findIndex(
    (tab) =>
      tab.value.length === estado.length &&
      tab.value.every((v) => estado.includes(v))
  );

  const handleTabClick = (tabValue: string[]) => {
    onEstadoChange(tabValue);
    onPageChange(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Header compacto ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
        <h1 className="text-lg font-semibold">Asuntos Jurídicos</h1>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="default"
            className="size-8"
            onClick={onCreateClick}
          >
            <Plus className="size-4" />
            <span className="sr-only">Nuevo asunto</span>
          </Button>
        </div>
      </div>

      {/* ── Status Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-4 py-2 border-b overflow-x-auto scrollbar-none">
        {STATUS_TABS.map((tab, i) => (
          <button
            key={i}
            onClick={() => handleTabClick([...tab.value])}
            className={cn(
              "shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
              activeTabIndex === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Search + botón Filtros ──────────────────────────────────────── */}
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
            <div className="text-4xl">⚖️</div>
            <p className="text-sm font-medium">Sin asuntos</p>
            <p className="text-xs">
              No hay asuntos jurídicos que coincidan con los filtros activos.
            </p>
          </div>
        ) : (
          data.data.map((asunto) => (
            <AsuntoJuridicoMobileCard
              key={asunto.id}
              asunto={asunto}
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

      {/* ── Drawer de filtros ─────────────────────────────────────────────── */}
      <AsuntoJuridicoMobileFiltersDrawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        search={search}
        onSearchChange={onSearchChange}
        estado={estado}
        onEstadoChange={onEstadoChange}
        onClearFilters={onClearFilters}
      />
    </div>
  );
}
