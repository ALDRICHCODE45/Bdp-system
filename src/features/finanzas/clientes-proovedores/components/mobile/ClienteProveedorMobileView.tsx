"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import { Skeleton } from "@/core/shared/ui/skeleton";
import { cn } from "@/core/lib/utils";
import type { PaginatedResult } from "@/core/shared/types/pagination.types";
import type { ClienteProveedorDto } from "../../server/dtos/ClienteProveedorDto.dto";
import { ClienteProveedorMobileCard } from "./ClienteProveedorMobileCard";
import { ClienteProveedorMobileFiltersDrawer } from "./ClienteProveedorMobileFiltersDrawer";

// ── Skeleton loader ───────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm space-y-2.5">
      <div className="flex justify-between gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-2/3 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
      <div className="flex justify-between pt-1">
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-7 w-7 rounded" />
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface ClienteProveedorMobileViewProps {
  data: PaginatedResult<ClienteProveedorDto> | undefined;
  isLoading: boolean;
  onCreateClick?: () => void;
  onViewDetail: (clienteProveedor: ClienteProveedorDto) => void;
  // Paginación (misma paginación server-side que desktop)
  page: number;
  onPageChange: (page: number) => void;
  // Búsqueda (server-side, debounced en el hook de filtros)
  search: string;
  onSearchChange: (value: string) => void;
  // Filtros compartidos con desktop
  selectedTipo: string;
  onTipoChange: (value: string) => void;
  selectedEstado: string;
  onEstadoChange: (value: string) => void;
  selectedBanco: string;
  onBancoChange: (value: string) => void;
  socioResponsableFilter: string;
  onSocioResponsableChange: (value: string) => void;
  selectedDateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onClearFilters: () => void;
}

export function ClienteProveedorMobileView({
  data,
  isLoading,
  onCreateClick,
  onViewDetail,
  page,
  onPageChange,
  search,
  onSearchChange,
  selectedTipo,
  onTipoChange,
  selectedEstado,
  onEstadoChange,
  selectedBanco,
  onBancoChange,
  socioResponsableFilter,
  onSocioResponsableChange,
  selectedDateRange,
  onDateRangeChange,
  onClearFilters,
}: ClienteProveedorMobileViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedTipo !== "todos") count++;
    if (selectedEstado !== "todos") count++;
    if (selectedBanco !== "todos") count++;
    if (socioResponsableFilter.trim()) count++;
    if (selectedDateRange?.from || selectedDateRange?.to) count++;
    return count;
  }, [
    selectedTipo,
    selectedEstado,
    selectedBanco,
    socioResponsableFilter,
    selectedDateRange,
  ]);

  const totalCount = data?.totalCount ?? 0;
  const pageCount = Math.max(1, data?.pageCount ?? 1);
  const items = data?.data ?? [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Header compacto ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
        <h1 className="text-lg font-semibold">Clientes y Proveedores</h1>
        {onCreateClick && (
          <Button
            size="icon"
            variant="default"
            className="size-8"
            onClick={onCreateClick}
          >
            <Plus className="size-4" />
            <span className="sr-only">Agregar cliente o proveedor</span>
          </Button>
        )}
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
            <div className="text-4xl">👥</div>
            <p className="text-sm font-medium">Sin clientes ni proveedores</p>
            <p className="text-xs">
              No hay registros que coincidan con los filtros activos.
            </p>
          </div>
        ) : (
          items.map((clienteProveedor) => (
            <ClienteProveedorMobileCard
              key={clienteProveedor.id}
              clienteProveedor={clienteProveedor}
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

      {/* ── Drawer de filtros ────────────────────────────────────────────── */}
      <ClienteProveedorMobileFiltersDrawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        selectedTipo={selectedTipo}
        onTipoChange={onTipoChange}
        selectedEstado={selectedEstado}
        onEstadoChange={onEstadoChange}
        selectedBanco={selectedBanco}
        onBancoChange={onBancoChange}
        socioResponsableFilter={socioResponsableFilter}
        onSocioResponsableChange={onSocioResponsableChange}
        selectedDateRange={selectedDateRange}
        onDateRangeChange={onDateRangeChange}
        onClearFilters={onClearFilters}
      />
    </div>
  );
}
