"use client";

import { useMemo } from "react";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { TooltipProvider } from "@/core/shared/ui/tooltip";
import { cn } from "@/core/lib/utils";
import type { MovimientoListItemDto } from "../server/dtos/MovimientoListDto.dto";
import type { MovimientoFilterInput } from "../server/actions/getMovimientosAction";
import {
  getMovimientosColumns,
  MOVIMIENTOS_DEFAULT_VISIBILITY,
} from "./MovimientosColumns";
import {
  MovimientoAggregates,
  type MovimientoAggregatesData,
} from "./MovimientoAggregates";
import { MovimientoFilters, type MovimientoFiltersProps } from "./MovimientoFilters";
import type { PaginationState, SortingState } from "@tanstack/react-table";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MovimientosTableProps {
  data: MovimientoListItemDto[];
  total: number;
  pageCount: number;
  aggregates: MovimientoAggregatesData | undefined;
  filters: MovimientoFilterInput;
  onFiltersChange: (f: MovimientoFilterInput) => void;
  isLoading: boolean;
  isFetching: boolean;
  // Pagination / sorting controlled state
  pagination: PaginationState;
  onPaginationChange: (p: PaginationState) => void;
  sorting: SortingState;
  onSortingChange: (s: SortingState) => void;
  // Search
  onGlobalFilterChange?: (value: string) => void;
  // Row action callbacks
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  // Filter bar extra callbacks
  onImport?: () => void;
  onAdd?: () => void;
  onClearFilters?: () => void;
  /** Titulares for the advanced filter combobox */
  titulares?: string[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MovimientosTable({
  data,
  total,
  pageCount,
  aggregates,
  filters,
  onFiltersChange,
  isLoading,
  isFetching,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  onGlobalFilterChange,
  onView,
  onEdit,
  onDelete,
  onImport,
  onAdd,
  onClearFilters,
  titulares,
}: MovimientosTableProps) {
  // Memoize columns to prevent infinite re-renders (TanStack Table requirement)
  const columns = useMemo(
    () => getMovimientosColumns({ onView, onEdit, onDelete }),
    [onView, onEdit, onDelete],
  );

  // Build filter props for the custom filter component
  const filterProps: MovimientoFiltersProps = {
    table: null as unknown as MovimientoFiltersProps["table"], // Injected by DataTable
    filters,
    onFiltersChange,
    onImport,
    onAdd,
    onClearFilters,
    titulares,
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 w-full">
        {/* Aggregates bar */}
        <MovimientoAggregates
          aggregates={aggregates}
          isLoading={isLoading}
        />

        {/* DataTable — server-side mode */}
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          isFetching={isFetching}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          sorting={sorting}
          onSortingChange={onSortingChange}
          onGlobalFilterChange={onGlobalFilterChange}
          config={{
            serverSide: {
              enabled: true,
              totalCount: total,
              pageCount,
              isLoading,
              isFetching,
            },
            pagination: {
              defaultPageSize: 20,
              pageSizeOptions: [10, 20, 50, 100],
              showPageSizeSelector: true,
              showPaginationInfo: true,
            },
            enableSorting: true,
            enableColumnVisibility: true,
            enableRowSelection: true,
            defaultColumnVisibility: MOVIMIENTOS_DEFAULT_VISIBILITY,
            filters: {
              showSearch: false, // Search handled by parent page
              customFilter: {
                component: MovimientoFilters as React.ComponentType<
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  any
                >,
                props: filterProps,
              },
            },
            emptyStateMessage: "No se encontraron movimientos.",
          }}
        />
      </div>
    </TooltipProvider>
  );
}

/**
 * Row className function for the visual convention.
 * INGRESO rows: bold text. EGRESO rows: no extra row styling (red applied at monto cell level).
 *
 * Usage: pass this to the DataTable body or apply via row meta when the shared DataTable
 * supports custom row classNames. For now, the visual convention is enforced at the
 * column-cell level in MovimientosColumns (monto cell: INGRESO=bold, EGRESO=red).
 */
export function getMovimientoRowClassName(
  row: MovimientoListItemDto,
): string {
  return cn(row.tipo === "INGRESO" && "font-semibold");
}
