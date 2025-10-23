"use client";
import { useId, useRef, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
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
  Table as TanStackTable,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ListFilterIcon,
  UserPlus,
  RefreshCw,
  Download,
} from "lucide-react";

import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/shared/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { Label } from "@/core/shared/ui/label";
import { TableConfig } from "./DataTable/types";

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
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Componente de filtros personalizado
  const CustomFilterComponent = finalConfig.filters.customFilter?.component;
  const customFilterProps = finalConfig.filters.customFilter?.props || {};

  // Componente de acciones personalizado
  const CustomActionComponent =
    finalConfig.actions.customActionComponent?.component;
  const customActionProps =
    finalConfig.actions.customActionComponent?.props || {};

  return (
    <div className="space-y-4 w-full max-w-full min-w-0">
      {/* Filtros personalizados o por defecto */}
      {CustomFilterComponent ? (
        <CustomFilterComponent
          table={table as unknown as TanStackTable<unknown>}
          onGlobalFilterChange={setGlobalFilter}
          {...customFilterProps}
        />
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
            {/* Search input */}
            {finalConfig.filters.showSearch && (
              <div className="relative flex-1 max-w-md">
                <Input
                  id={`${id}-input`}
                  ref={inputRef}
                  className="w-full pl-9"
                  value={
                    (table
                      .getColumn(finalConfig.filters.searchColumn || "nombre")
                      ?.getFilterValue() ?? "") as string
                  }
                  onChange={(e) =>
                    table
                      .getColumn(finalConfig.filters.searchColumn || "nombre")
                      ?.setFilterValue(e.target.value)
                  }
                  placeholder={finalConfig.filters.searchPlaceholder}
                  type="text"
                />
                <ListFilterIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Acciones personalizadas o por defecto */}
          {CustomActionComponent ? (
            <CustomActionComponent
              table={table as unknown as TanStackTable<unknown>}
              onAdd={finalConfig.actions.onAdd}
              onExport={finalConfig.actions.onExport}
              onRefresh={finalConfig.actions.onRefresh}
              customActions={finalConfig.actions.customActions}
              {...customActionProps}
            />
          ) : (
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
              {/* Botón de agregar */}
              {finalConfig.actions.showAddButton && (
                <Button
                  variant="default"
                  className="w-full sm:w-auto"
                  onClick={finalConfig.actions.onAdd}
                >
                  {finalConfig.actions.addButtonIcon}
                  {finalConfig.actions.addButtonText}
                </Button>
              )}

              {/* Botón de exportar */}
              {finalConfig.actions.showExportButton && (
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={finalConfig.actions.onExport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              )}

              {/* Botón de actualizar */}
              {finalConfig.actions.showRefreshButton && (
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={finalConfig.actions.onRefresh}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              )}

              {/* Acciones personalizadas */}
              {finalConfig.actions.customActions}
            </div>
          )}
        </div>
      )}

      {/* Table Container with Horizontal Scroll */}
      <div className="rounded-lg border shadow-sm w-full min-w-0">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => {
                    const size = header.getSize();
                    return (
                      <TableHead
                        key={header.id}
                        className="h-12 px-6 text-left font-medium whitespace-nowrap"
                        style={{
                          width: `${size}%`,
                          minWidth: `${Math.max(size * 1.5, 100)}px`,
                        }}
                      >
                        {header.isPlaceholder ? null : finalConfig.enableSorting &&
                          header.column.getCanSort() ? (
                          <button
                            className="flex items-center gap-2 hover:text-gray-400"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: <ChevronUpIcon className="h-4 w-4" />,
                              desc: <ChevronDownIcon className="h-4 w-4" />,
                            }[header.column.getIsSorted() as string] ?? null}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b"
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const size = cell.column.getSize();
                      return (
                        <TableCell
                          key={cell.id}
                          className="px-6 py-4"
                          style={{
                            width: `${size}%`,
                            minWidth: `${Math.max(size * 1.5, 100)}px`,
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500"
                  >
                    {finalConfig.emptyStateMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Información de paginación */}
          {finalConfig.pagination.showPaginationInfo && (
            <div className="text-sm text-gray-400 text-center sm:text-left">
              Mostrando{" "}
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}{" "}
              a{" "}
              {Math.min(
                table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  table.getState().pagination.pageSize,
                table.getRowCount()
              )}{" "}
              de {table.getRowCount()} resultados
            </div>
          )}

          {/* Selector de tamaño de página */}
          {finalConfig.pagination.showPageSizeSelector && (
            <div className="flex items-center gap-2">
              <Label htmlFor="page-size" className="text-sm">
                Filas por página:
              </Label>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger id="page-size" className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    finalConfig.pagination.pageSizeOptions || [5, 10, 20, 50]
                  ).map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          <span className="text-sm text-gray-400 whitespace-nowrap">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
