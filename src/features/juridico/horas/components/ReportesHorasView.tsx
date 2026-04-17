"use client";
import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFacetedUniqueValues,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Button } from "@/core/shared/ui/button";
import { Badge } from "@/core/shared/ui/badge";
import { Skeleton } from "@/core/shared/ui/skeleton";
import { Loader2, FileSpreadsheet, Clock, BarChart3 } from "lucide-react";
import { exportToExcel } from "@/core/shared/helpers/exportToExcel";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { useGetReporteHoras } from "../hooks/useGetReporteHoras.hook";
import { formatHoras } from "../helpers/formatHoras";
import { ReportesFilters } from "./ReportesFilters";
import { reporteHorasColumns } from "./ReportesHorasTableColumns";
import { ReporteHoraMobileCard } from "./mobile/ReporteHoraMobileCard";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import type { ReporteHorasFilters } from "../server/dtos/ReporteHorasDto.dto";
import type { TableConfig } from "@/core/shared/components/DataTable/types";
import type { ReporteHorasRowDto } from "../server/dtos/ReporteHorasDto.dto";

const tableConfig: TableConfig<ReporteHorasRowDto> = {
  filters: {
    searchColumn: "clienteNombre",
    searchPlaceholder: "Buscar por cliente...",
    showSearch: true,
  },
  actions: {
    showAddButton: false,
  },
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No se encontraron registros con los filtros seleccionados.",
  enableSorting: true,
  enableColumnVisibility: true,
  enableRowSelection: false,
};

// ── Skeleton for mobile card list ─────────────────────────────────────────────
function MobileCardSkeleton() {
  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm space-y-2.5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-24 rounded" />
        <Skeleton className="h-5 w-14 rounded" />
      </div>
      <Skeleton className="h-4 w-2/3 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
      <Skeleton className="h-3 w-3/4 rounded" />
      <div className="flex justify-between pt-1.5 border-t border-border/50">
        <Skeleton className="h-3 w-28 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
    </div>
  );
}

export function ReportesHorasView() {
  const [filters, setFilters] = useState<ReporteHorasFilters>({});
  const isMobile = useIsMobile();

  // We need a table instance for exportToExcel — build a controlled one with all data (no pagination limit)
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { data, isPending, isFetching } = useGetReporteHoras(filters);

  const rows = data?.rows ?? [];

  // Build a table instance with all data for Excel export
  const exportTable = useReactTable({
    data: rows,
    columns: reporteHorasColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: { pageIndex: 0, pageSize: rows.length || 1 }, // all rows for export
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleExport = () => {
    exportToExcel(exportTable, `reporte-horas-${new Date().toISOString().split("T")[0]}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters */}
      <ReportesFilters filters={filters} onFiltersChange={setFilters} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Horas */}
        <div className="rounded-lg border bg-card p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-md shrink-0">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-700" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Total Horas</div>
            <div className="text-xl sm:text-2xl font-bold tabular-nums">
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                formatHoras(data?.totalHoras ?? 0)
              )}
            </div>
          </div>
        </div>

        {/* Total Registros */}
        <div className="rounded-lg border bg-card p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-green-100 rounded-md shrink-0">
            <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-700" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Registros</div>
            <div className="text-xl sm:text-2xl font-bold tabular-nums">
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                data?.totalRegistros ?? 0
              )}
            </div>
          </div>
        </div>

        {/* Exportar — spans 2 cols on mobile, 1 col on sm+ */}
        <div className="col-span-2 sm:col-span-1 rounded-lg border bg-card p-3 sm:p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-xs text-muted-foreground">Exportar datos</div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              disabled={isPending || rows.length === 0}
              className="h-8 text-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
              Excel
            </Button>
          </div>
          {isFetching && !isPending && (
            <Badge variant="secondary" className="text-xs shrink-0">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Actualizando...
            </Badge>
          )}
        </div>
      </div>

      {/* Data — Table on desktop, card list on mobile */}
      {isMobile ? (
        <div className="space-y-3">
          {isPending && rows.length === 0 ? (
            <>
              <MobileCardSkeleton />
              <MobileCardSkeleton />
              <MobileCardSkeleton />
              <MobileCardSkeleton />
            </>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
              <div className="text-4xl">📋</div>
              <p className="text-sm font-medium">Sin registros</p>
              <p className="text-xs">
                No hay registros de horas que coincidan con los filtros seleccionados.
              </p>
            </div>
          ) : (
            rows.map((row) => (
              <ReporteHoraMobileCard key={row.id} reporte={row} />
            ))
          )}
        </div>
      ) : (
        <DataTable
          columns={reporteHorasColumns}
          data={rows}
          config={tableConfig}
          isLoading={isPending && rows.length === 0}
          isFetching={isFetching}
        />
      )}
    </div>
  );
}
