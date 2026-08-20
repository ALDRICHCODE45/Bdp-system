"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/core/shared/ui/button";
import { Skeleton } from "@/core/shared/ui/skeleton";
import { Input } from "@/core/shared/ui/input";
import type { TarifaAbogadoAsuntoDto } from "../../server/dtos/TarifaAbogadoAsuntoDto.dto";
import { TarifaMobileCard } from "./TarifaMobileCard";

const PAGE_SIZE = 20;

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
interface TarifaMobileViewProps {
  data: TarifaAbogadoAsuntoDto[] | undefined;
  isLoading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  onCreateClick: () => void;
}

// ── Componente principal ──────────────────────────────────────────────────────
export function TarifaMobileView({
  data,
  isLoading,
  search,
  onSearchChange,
  onCreateClick,
}: TarifaMobileViewProps) {
  const [page, setPage] = useState(1);

  const totalCount = data?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Reset a página 1 cuando cambia la búsqueda o el volumen de datos.
  useEffect(() => {
    setPage(1);
  }, [search, totalCount]);

  const pagedData = useMemo(() => {
    if (!data) return [];
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Header compacto ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
        <h1 className="text-lg font-semibold">Tarifas</h1>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="default"
            className="size-8"
            onClick={onCreateClick}
          >
            <Plus className="size-4" />
            <span className="sr-only">Crear tarifa</span>
          </Button>
        </div>
      </div>

      {/* ── Search ──────────────────────────────────────────────────────── */}
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
        <span className="text-xs text-muted-foreground shrink-0">
          {totalCount.toLocaleString("es-MX")} resultados
        </span>
      </div>

      {/* ── Lista de cards ────────────────────────────────────────────────── */}
      <div className="flex-1 px-4 py-3 space-y-3">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : !data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
            <div className="text-4xl">💰</div>
            <p className="text-sm font-medium">Sin tarifas</p>
            <p className="text-xs">
              No hay tarifas que coincidan con los filtros activos.
            </p>
          </div>
        ) : (
          pagedData.map((tarifa) => (
            <TarifaMobileCard key={tarifa.id} tarifa={tarifa} />
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
            onClick={() => setPage(page - 1)}
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
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Página siguiente</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
