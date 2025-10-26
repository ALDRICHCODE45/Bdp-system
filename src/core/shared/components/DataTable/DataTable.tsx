"use client";
import { useState } from "react";
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

import { TableConfig } from "./types";
import { TableBodyDataTable } from "./DataTableBody";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableFilters } from "./DataTableFilters";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  config?: TableConfig<TData>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  config = {},
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");

  // Configuración por defecto
  const defaultConfig: Required<TableConfig<TData>> = {
    filters: {
      searchColumn: "nombre",
      searchPlaceholder: "Buscar...",
      showSearch: true,
    },
    actions: {
      showAddButton: true,
      addButtonText: "Agregar",
      addButtonIcon: <UserPlus />,
      showExportButton: false,
      showRefreshButton: false,
    },
    pagination: {
      defaultPageSize: 5,
      pageSizeOptions: [5, 10, 20, 50],
      showPageSizeSelector: true,
      showPaginationInfo: true,
    },
    emptyStateMessage: "No se encontraron resultados.",
    enableSorting: true,
    enableColumnVisibility: false,
    enableRowSelection: false,
  };

  // Combinar configuración por defecto con la proporcionada
  const finalConfig = {
    filters: { ...defaultConfig.filters, ...config.filters },
    actions: { ...defaultConfig.actions, ...config.actions },
    pagination: { ...defaultConfig.pagination, ...config.pagination },
    emptyStateMessage:
      config.emptyStateMessage || defaultConfig.emptyStateMessage,
    enableSorting: config.enableSorting ?? defaultConfig.enableSorting,
    enableColumnVisibility:
      config.enableColumnVisibility ?? defaultConfig.enableColumnVisibility,
    enableRowSelection:
      config.enableRowSelection ?? defaultConfig.enableRowSelection,
  };

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: finalConfig.pagination.defaultPageSize || 10,
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
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
    <div className="space-y-4 w-full max-w-full min-w-0 overflow-hidden">
      {/* Filtros personalizados o por defecto */}
      <div className="w-full min-w-0">
        <DataTableFilters
          config={finalConfig}
          setGlobalFilter={setGlobalFilter}
          table={table}
        />
      </div>

      {/* Cuerpo de la tabla*/}
      <div className="w-full min-w-0">
        <TableBodyDataTable<TData, TValue>
          columns={columns}
          config={finalConfig}
          table={table}
        />
      </div>

      {/* Pagination */}
      <div className="w-full min-w-0">
        <DataTablePagination<TData, TValue>
          config={finalConfig}
          table={table}
        />
      </div>
    </div>
  );
}
