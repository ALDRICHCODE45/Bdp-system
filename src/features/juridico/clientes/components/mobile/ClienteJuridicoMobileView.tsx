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
import type { ClienteJuridicoDto } from "../../server/dtos/ClienteJuridicoDto.dto";
import { ClienteJuridicoMobileCard } from "./ClienteJuridicoMobileCard";
import { ClienteJuridicoMobileFiltersDrawer } from "./ClienteJuridicoMobileFiltersDrawer";

// ── Skeleton loaders ──────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm space-y-2.5">
      <div className="flex justify-between gap-2">
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-2 w-2 rounded-full" />
      </div>
      <Skeleton className="h-3 w-1/3 rounded" />
      <Skeleton className="h-3 w-3/4 rounded" />
      <div className="flex justify-between pt-1">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-7 w-7 rounded" />
      </div>
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────
interface ClienteJuridicoMobileViewProps {
  data: PaginatedResult<ClienteJuridicoDto> | undefined;
  isLoading: boolean;
  onCreateClick: () => void;
  onViewDetail: (cliente: ClienteJuridicoDto) => void;
  // Paginación
  page: number;
  onPageChange: (page: number) => void;
  // Búsqueda
  search: string;
  onSearchChange: (v: string) => void;
  onClearFilters: () => void;
}

// ── Componente principal ──────────────────────────────────────────────────────
export function ClienteJuridicoMobileView({
  data,
  isLoading,
  onCreateClick,
  onViewDetail,
  page,
  onPageChange,
  search,
  onSearchChange,
  onClearFilters,
}: ClienteJuridicoMobileViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const totalCount = data?.totalCount ?? 0;
  const pageCount = data?.pageCount ?? 1;

  const hasActiveFilters = search.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Header compacto ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
        <h1 className="text-lg font-semibold">Clientes Jurídicos</h1>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="default"
            className="size-8"
            onClick={onCreateClick}
          >
            <Plus className="size-4" />
            <span className="sr-only">Nuevo cliente</span>
          </Button>
        </div>
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
            hasActiveFilters && "border-primary text-primary"
          )}
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal className="size-3.5" />
          Filtros
          {hasActiveFilters && (
            <Badge className="ml-0.5 size-4 p-0 flex items-center justify-center text-[10px]">
              1
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
            <div className="text-4xl">🏢</div>
            <p className="text-sm font-medium">Sin clientes</p>
            <p className="text-xs">
              No hay clientes jurídicos que coincidan con los filtros activos.
            </p>
          </div>
        ) : (
          data.data.map((cliente) => (
            <ClienteJuridicoMobileCard
              key={cliente.id}
              cliente={cliente}
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
      <ClienteJuridicoMobileFiltersDrawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        search={search}
        onSearchChange={onSearchChange}
        onClearFilters={onClearFilters}
      />
    </div>
  );
}
