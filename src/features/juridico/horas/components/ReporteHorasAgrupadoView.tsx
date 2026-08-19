"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import type { TableConfig } from "@/core/shared/components/DataTable/types";
import { ExportActions } from "@/core/shared/components/DataTable/ExportActions";
import { Badge } from "@/core/shared/ui/badge";
import { ReporteHorasAgrupadoFilters } from "./ReporteHorasAgrupadoFilters";
import { createReporteHorasAgrupadoColumns } from "./ReporteHorasAgrupadoColumns";
import { SubtotalesPanel } from "./SubtotalesPanel";
import { useReporteEntities } from "./ReporteHorasAgrupadoProvider";
import { useReporteHorasAgrupado } from "../hooks/useReporteHorasAgrupado.hook";
import { useExportHorasAgrupadas } from "../hooks/useExportHorasAgrupadas.hook";
import { exportHorasAgrupadasToExcel } from "../helpers/exportHorasAgrupadasToExcel";
import {
  exportHorasResumenToPDF,
  type ReportePdfFilterLabels,
} from "../helpers/exportHorasResumenToPDF";
import { formatHoras } from "../helpers/formatHoras";
import type {
  ReporteAgrupadoSortField,
  ReporteGrupoDto,
} from "../server/dtos/ReporteHorasAgrupadoDto.dto";
import type {
  ReporteHorasAgrupadoFiltersState,
  ReporteHorasAgrupadoSortState,
} from "../types/ReporteHorasAgrupadoFilters.type";

const DEFAULT_PAGE_SIZE = 20;

export function ReporteHorasAgrupadoView() {
  const [filters, setFilters] = useState<ReporteHorasAgrupadoFiltersState>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sort, setSort] = useState<ReporteHorasAgrupadoSortState | undefined>(
    undefined,
  );

  const resetPage = useCallback(() => setPage(1), []);

  const handleFiltersChange = useCallback(
    (next: ReporteHorasAgrupadoFiltersState) => {
      setFilters(next);
      resetPage();
    },
    [resetPage],
  );

  const query = useMemo(
    () => ({ filters, page, pageSize, sort }),
    [filters, page, pageSize, sort],
  );

  const { data, isPending, isFetching, error } = useReporteHorasAgrupado(query);

  const exportMutation = useExportHorasAgrupadas();

  // Datos de entidades (cacheados por TanStack Query — los mismos que usan
  // los filtros) para resolver id → nombre en los criterios del PDF.
  const { equipos, clientes, asuntos, socios, usuarios } = useReporteEntities();

  const pdfLabels: ReportePdfFilterLabels = useMemo(() => {
    const toMap = (rows: { id: string; nombre?: string; name?: string }[]) => {
      const map: Record<string, string> = {};
      for (const r of rows) map[r.id] = r.nombre ?? r.name ?? r.id;
      return map;
    };
    return {
      usuarioId: toMap(usuarios ?? []),
      asuntoJuridicoId: toMap(asuntos ?? []),
      clienteProveedorId: toMap(clientes ?? []),
      equipoJuridicoId: toMap(equipos ?? []),
      socioId: toMap(socios ?? []),
    };
  }, [equipos, clientes, asuntos, socios, usuarios]);

  const grupos: ReporteGrupoDto[] = data?.grupos ?? [];

  const handleExportExcel = useCallback(async () => {
    const toastId = toast.loading("Preparando exportación a Excel...");
    try {
      const result = await exportMutation.mutateAsync(filters);
      exportHorasAgrupadasToExcel(result, "reporte-horas-agrupado");
      toast.dismiss(toastId);
      toast.success(
        `${result.length} grupos exportados a Excel correctamente.`,
      );
    } catch (e) {
      toast.dismiss(toastId);
      toast.error(
        e instanceof Error ? e.message : "Error al exportar a Excel.",
      );
    }
  }, [exportMutation, filters]);

  const handleExportPDF = useCallback(async () => {
    if (!data?.subtotales) {
      toast.error("Aún no hay datos para exportar.");
      return;
    }
    const toastId = toast.loading("Generando resumen PDF...");
    try {
      await exportHorasResumenToPDF(filters, data.subtotales, pdfLabels);
      toast.dismiss(toastId);
      toast.success("Resumen PDF generado correctamente.");
    } catch (e) {
      toast.dismiss(toastId);
      toast.error(e instanceof Error ? e.message : "Error al generar el PDF.");
    }
  }, [data?.subtotales, filters, pdfLabels]);

  // ── TanStack Table server-side state ────────────────────────────────────
  const paginationState: PaginationState = useMemo(
    () => ({ pageIndex: page - 1, pageSize }),
    [page, pageSize],
  );

  const sortingState: SortingState = useMemo(() => {
    if (!sort) return [];
    return [{ id: sort.field, desc: sort.direction === "desc" }];
  }, [sort]);

  const handlePaginationChange = useCallback((next: PaginationState) => {
    setPage(next.pageIndex + 1);
    setPageSize(next.pageSize);
  }, []);

  const handleSortingChange = useCallback((next: SortingState) => {
    if (next.length === 0) {
      setSort(undefined);
      return;
    }
    const first = next[0];
    // Solo aceptamos sort sobre columnas conocidas.
    const allowed: ReporteAgrupadoSortField[] = ["ano", "semana", "horas"];
    if (!allowed.includes(first.id as ReporteAgrupadoSortField)) {
      setSort(undefined);
      return;
    }
    setSort({
      field: first.id as ReporteAgrupadoSortField,
      direction: first.desc ? "desc" : "asc",
    });
    setPage(1);
  }, []);

  // ── Columns ─────────────────────────────────────────────────────────────
  const columns = useMemo(() => createReporteHorasAgrupadoColumns(), []);

  // ── Totals row (shows the row total across the whole filtered set) ─────
  const totalsRow: ReactNode[] | undefined = useMemo(() => {
    if (!data?.subtotales) return undefined;
    const totalHoras = data.subtotales.totalHoras;
    return [
      "", // periodo
      "Total",
      "Total",
      "Total",
      "Total",
      "Total",
      "Total",
      <span
        key="horas"
        className="font-mono tabular-nums"
      >
        {formatHoras(totalHoras)}
      </span>,
    ];
  }, [data?.subtotales]);

  // ── Table config ────────────────────────────────────────────────────────
  const tableConfig: TableConfig<ReporteGrupoDto> = useMemo(
    () =>
      ({
        filters: { showSearch: false },
        actions: { showAddButton: false },
        pagination: {
          defaultPageSize: DEFAULT_PAGE_SIZE,
          pageSizeOptions: [10, 20, 50, 100],
          showPageSizeSelector: true,
          showPaginationInfo: true,
        },
        emptyStateMessage:
          "No hay grupos que coincidan con los filtros seleccionados.",
        enableSorting: true,
        enableColumnVisibility: true,
        enableRowSelection: false,
        stickyHeader: true,
        showTotalsRow: true,
        compactDensity: true,
        serverSide: {
          enabled: true,
          totalCount: data?.totalCount ?? 0,
          pageCount: Math.ceil((data?.totalCount ?? 0) / pageSize),
        },
      }) as TableConfig<ReporteGrupoDto>,
    [data?.totalCount, pageSize],
  );

  const isInitialLoading = isPending && !data;
  const isFetchingMore = isFetching && !!data;
  const errorMessage = error instanceof Error ? error.message : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters */}
      <ReporteHorasAgrupadoFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Toolbar row: result count + ExportActions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-normal">
            {isInitialLoading
              ? "Cargando…"
              : `${(data?.totalCount ?? 0).toLocaleString("es-MX")} resultados`}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <ExportActions
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
            isExporting={exportMutation.isPending}
            resultCount={data?.totalCount}
            disablePDF={!data?.subtotales || isInitialLoading}
          />
        </div>
      </div>

      {/* Subtotals panel */}
      <SubtotalesPanel
        subtotales={data?.subtotales}
        isLoading={isInitialLoading}
      />

      {/* Data table */}
      {errorMessage ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive">
          {errorMessage}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={grupos}
          config={tableConfig}
          isLoading={isInitialLoading}
          isFetching={isFetchingMore}
          pagination={paginationState}
          sorting={sortingState}
          onPaginationChange={handlePaginationChange}
          onSortingChange={handleSortingChange}
          totalsRow={totalsRow}
        />
      )}
    </div>
  );
}
