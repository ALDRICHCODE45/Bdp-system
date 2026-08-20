"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/core/shared/ui/button";
import { Skeleton } from "@/core/shared/ui/skeleton";
import { cn } from "@/core/lib/utils";
import { formatHoras } from "../../helpers/formatHoras";
import type {
  ReporteAgrupadoPageDto,
  SubtotalesDto,
} from "../../server/dtos/ReporteHorasAgrupadoDto.dto";
import { ReporteMobileCard } from "./ReporteMobileCard";

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// ── Skeleton loaders ──────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm space-y-2.5">
      <div className="flex justify-between gap-2">
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-3/4 rounded" />
      <Skeleton className="h-5 w-20 rounded" />
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Skeleton className="h-7 w-full rounded" />
        <Skeleton className="h-7 w-full rounded" />
      </div>
    </div>
  );
}

// ── MobileSubtotales (patrón MobileAggregates) ────────────────────────────────
function MobileSubtotales({
  subtotales,
  isLoading,
}: {
  subtotales: SubtotalesDto | undefined;
  isLoading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!subtotales && !isLoading) return null;

  const porAbogado = subtotales?.porAbogado ?? [];

  return (
    <div className="border-t bg-muted/20 px-4 py-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between w-full text-xs text-muted-foreground"
      >
        <span className="font-medium">
          Σ Totales (
          {subtotales ? subtotales.totalGrupos.toLocaleString("es-MX") : "…"}{" "}
          grupos)
        </span>
        <ChevronRight
          className={cn(
            "size-3.5 transition-transform",
            expanded && "rotate-90",
          )}
        />
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* ── KPIs ────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border bg-card p-2.5">
              <div className="text-[10px] text-muted-foreground">
                Total Horas
              </div>
              <div className="text-sm font-bold tabular-nums">
                {isLoading || !subtotales
                  ? "—"
                  : formatHoras(subtotales.totalHoras)}
              </div>
            </div>
            <div className="rounded-lg border bg-card p-2.5">
              <div className="text-[10px] text-muted-foreground">
                Total Importe
              </div>
              <div className="text-sm font-bold tabular-nums">
                {isLoading || !subtotales
                  ? "—"
                  : mxn.format(subtotales.totalImporte)}
              </div>
            </div>
            <div className="rounded-lg border bg-card p-2.5">
              <div className="text-[10px] text-muted-foreground">
                Total Grupos
              </div>
              <div className="text-sm font-bold tabular-nums">
                {isLoading || !subtotales
                  ? "—"
                  : subtotales.totalGrupos.toLocaleString("es-MX")}
              </div>
            </div>
          </div>

          {/* ── Breakdown por abogado ───────────────────────────────────── */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Por abogado
            </p>
            {porAbogado.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Sin abogados en el set filtrado.
              </p>
            ) : (
              porAbogado.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="truncate flex-1">{row.nombre}</span>
                  <span className="font-mono tabular-nums shrink-0">
                    {formatHoras(row.horas)}
                  </span>
                  <span className="font-mono tabular-nums shrink-0">
                    {mxn.format(row.importe)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────
interface ReporteMobileViewProps {
  data: ReporteAgrupadoPageDto | undefined;
  isLoading: boolean;
  errorMessage?: string | null;
  page: number;
  pageCount: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  subtotales: SubtotalesDto | undefined;
  /** Filtros YA montados por el view padre (se adaptan solos a mobile). */
  filters: ReactNode;
  /** Acciones de exportación YA montadas (ExportActions del view padre). */
  exportActions: ReactNode;
}

// ── Componente principal ──────────────────────────────────────────────────────
export function ReporteMobileView({
  data,
  isLoading,
  errorMessage,
  page,
  pageCount,
  totalCount,
  onPageChange,
  subtotales,
  filters,
  exportActions,
}: ReporteMobileViewProps) {
  const grupos = data?.grupos ?? [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Header compacto ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
        <h1 className="text-lg font-semibold">Reporte de Horas</h1>
        <div className="flex items-center gap-2">{exportActions}</div>
      </div>

      {/* ── Filtros (botón + sheet, adaptados a mobile por el padre) ────── */}
      <div className="px-4 py-2 border-b">{filters}</div>

      {/* ── Lista de cards ────────────────────────────────────────────────── */}
      <div className="flex-1 px-4 py-3 space-y-3">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : errorMessage ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive">
            {errorMessage}
          </div>
        ) : grupos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
            <div className="text-4xl">📊</div>
            <p className="text-sm font-medium">Sin grupos</p>
            <p className="text-xs">
              No hay grupos que coincidan con los filtros seleccionados.
            </p>
          </div>
        ) : (
          grupos.map((grupo) => (
            <ReporteMobileCard
              key={`${grupo.usuarioId}-${grupo.asuntoJuridicoId}-${grupo.ano}-${grupo.semana}`}
              grupo={grupo}
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

      {/* ── Subtotales colapsables ───────────────────────────────────────── */}
      <MobileSubtotales subtotales={subtotales} isLoading={isLoading} />
    </div>
  );
}
