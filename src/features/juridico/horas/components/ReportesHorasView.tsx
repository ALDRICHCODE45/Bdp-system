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
import { Loader2, FileSpreadsheet, Clock, BarChart3 } from "lucide-react";
import { exportToExcel } from "@/core/shared/helpers/exportToExcel";
import { useGetReporteHoras } from "../hooks/useGetReporteHoras.hook";
import { formatHoras } from "../helpers/formatHoras";
import { ReportesFilters } from "./ReportesFilters";
import { reporteHorasColumns } from "./ReportesHorasTableColumns";
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

export function ReportesHorasView() {
  const [filters, setFilters] = useState<ReporteHorasFilters>({});

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
    <div className="space-y-6">
      {/* Filters */}
      <ReportesFilters filters={filters} onFiltersChange={setFilters} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-md">
            <Clock className="h-4 w-4 text-blue-700" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Horas</div>
            <div className="text-2xl font-bold tabular-nums">
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                formatHoras(data?.totalHoras ?? 0)
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-md">
            <BarChart3 className="h-4 w-4 text-green-700" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Registros</div>
            <div className="text-2xl font-bold tabular-nums">
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                data?.totalRegistros ?? 0
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 flex items-center gap-3 justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Exportar</div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              disabled={isPending || rows.length === 0}
              className="h-8 text-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
              Exportar a Excel
            </Button>
          </div>
          {isFetching && !isPending && (
            <Badge variant="secondary" className="text-xs">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Actualizando...
            </Badge>
          )}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={reporteHorasColumns}
        data={rows}
        config={tableConfig}
        isLoading={isPending && rows.length === 0}
        isFetching={isFetching}
      />
    </div>
  );
}
