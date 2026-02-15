"use no memo";
"use client";
import { useMemo, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import { UserPlus } from "lucide-react";
import { TooltipProvider } from "@/core/shared/ui/tooltip";

import { TableConfig } from "./types";
import { TableBodyDataTable } from "./DataTableBody";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableFilters } from "./DataTableFilters";
import { TableSkeleton } from "./TableSkeleton";

// Default config values (static, defined outside component to avoid re-creation)
const DEFAULT_FILTERS = {
  searchColumn: "nombre",
  searchPlaceholder: "Buscar...",
  showSearch: true,
} as const;

const DEFAULT_ACTIONS = {
  showAddButton: true,
  addButtonText: "Agregar",
  showExportButton: false,
  showRefreshButton: false,
} as const;

const DEFAULT_PAGINATION = {
  defaultPageSize: 5,
  pageSizeOptions: [5, 10, 20, 50] as number[],
  showPageSizeSelector: true,
  showPaginationInfo: true,
} as const;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  config?: TableConfig<TData>;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  config = {},
  isLoading: isLoadingProp,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");

  // Combinar configuración por defecto con la proporcionada
  const finalConfig = useMemo(() => ({
    filters: { ...DEFAULT_FILTERS, ...config.filters },
    actions: { addButtonIcon: <UserPlus />, ...DEFAULT_ACTIONS, ...config.actions },
    pagination: { ...DEFAULT_PAGINATION, ...config.pagination },
    emptyStateMessage:
      config.emptyStateMessage || "No se encontraron resultados.",
    enableSorting: config.enableSorting ?? true,
    enableColumnVisibility: config.enableColumnVisibility ?? false,
    enableRowSelection: config.enableRowSelection ?? false,
    isLoading: isLoadingProp ?? config.isLoading ?? false,
    skeletonRows: config.skeletonRows ?? 5,
    manualSorting: config.manualSorting,
    onSortingChange: config.onSortingChange,
    manualFiltering: config.manualFiltering,
    onColumnFiltersChange: config.onColumnFiltersChange,
  }), [config, isLoadingProp]);

  const isManualPagination = !!finalConfig.pagination.manualPagination;
  const isManualSorting = !!finalConfig.manualSorting;
  const isManualFiltering = !!finalConfig.manualFiltering;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: finalConfig.pagination.defaultPageSize || 10,
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: isManualSorting ? undefined : getSortedRowModel(),
    manualSorting: isManualSorting,
    onSortingChange: (updater) => {
      setSorting(updater);
      if (finalConfig.onSortingChange) {
        const newSorting =
          typeof updater === "function" ? updater(sorting) : updater;
        finalConfig.onSortingChange(newSorting);
      }
    },
    enableSortingRemoval: false,
    getPaginationRowModel: isManualPagination
      ? undefined
      : getPaginationRowModel(),
    manualPagination: isManualPagination,
    pageCount: isManualPagination
      ? (finalConfig.pagination.pageCount ?? -1)
      : undefined,
    rowCount: isManualPagination
      ? (finalConfig.pagination.totalCount ?? undefined)
      : undefined,
    onPaginationChange: (updater) => {
      setPagination(updater);
      if (finalConfig.pagination.onPaginationChange) {
        const newPagination =
          typeof updater === "function" ? updater(pagination) : updater;
        finalConfig.pagination.onPaginationChange(newPagination);
      }
    },
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
      if (finalConfig.onColumnFiltersChange) {
        const newFilters =
          typeof updater === "function" ? updater(columnFilters) : updater;
        finalConfig.onColumnFiltersChange(newFilters);
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    manualFiltering: isManualFiltering,
    getFilteredRowModel: (isManualPagination || isManualFiltering)
      ? undefined
      : getFilteredRowModel(),
    getFacetedUniqueValues: (isManualPagination || isManualFiltering)
      ? undefined
      : getFacetedUniqueValues(),
    enableRowSelection: finalConfig.enableRowSelection,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <TooltipProvider>
    <div
      className="space-y-4 w-full max-w-full min-w-0 overflow-hidden"
      role="region"
      aria-label="Tabla de datos"
    >
      {/* Filtros personalizados o por defecto */}
      <div
        className="w-full min-w-0"
        role="search"
        aria-label="Filtros de búsqueda"
      >
        <DataTableFilters
          config={finalConfig}
          setGlobalFilter={setGlobalFilter}
          table={table}
        />
      </div>

      {/* Cuerpo de la tabla*/}
      <div className="w-full min-w-0">
        {finalConfig.isLoading ? (
          <TableSkeleton
            columns={columns.length}
            rows={finalConfig.skeletonRows}
          />
        ) : (
          <TableBodyDataTable<TData, TValue>
            columns={columns}
            config={finalConfig}
            table={table}
          />
        )}
      </div>

      {/* Pagination */}
      <nav className="w-full min-w-0" aria-label="Navegación de paginación">
        <DataTablePagination<TData> config={finalConfig} table={table} />
      </nav>
    </div>
    </TooltipProvider>
  );
}
