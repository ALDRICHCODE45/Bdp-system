"use client";

import { useMemo } from "react";
import type {
  PaginationState,
  SortingState,
  Table,
} from "@tanstack/react-table";
import type { ExportOptions } from "@/core/shared/components/DataTable/ExportButton";
import type { TableConfig } from "@/core/shared/components/DataTable/types";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import { TooltipProvider } from "@/core/shared/ui/tooltip";
import { cn } from "@/core/lib/utils";
import type { MovimientoListItemDto } from "../server/dtos/MovimientoListDto.dto";
import type { MovimientoFilterInput } from "../server/actions/getMovimientosAction";
import { getMovimientosColumns } from "./MovimientosColumns";
import { MovimientosTableConfig } from "./MovimientosTableConfig";
import {
  MovimientoAggregates,
  type MovimientoAggregatesData,
} from "./MovimientoAggregates";
import type { MovimientoFiltersProps } from "./MovimientoFilters";

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
  /** Excel export handler (all filtered rows or the selected ones). */
  onExport?: (table: Table<unknown>, options?: ExportOptions) => void;
  /** Bulk delete handler; omit it to hide the bulk delete action. */
  onBulkDelete?: (rows: MovimientoListItemDto[]) => void;
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
  onExport,
  onBulkDelete,
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

  const baseConfig = createTableConfig(MovimientosTableConfig, {
    onAdd,
    onImport,
    onBulkDelete,
    serverSide: {
      enabled: true,
      totalCount: total,
      pageCount,
      isLoading,
      isFetching,
    },
    customFilterProps: {
      filters,
      onFiltersChange,
      onImport,
      onAdd,
      onClearFilters,
      titulares,
      // El shared DataTable inyecta `config.actions.onExport` como prop
      // `onExport` del customFilter, así que el handler tiene que vivir en
      // `actions` (ver `config` más abajo).
    } satisfies Omit<MovimientoFiltersProps, "table">,
  });

  const config: TableConfig<MovimientoListItemDto> = {
    ...baseConfig,
    actions: {
      ...baseConfig.actions,
      // `onBulkDelete` ya lo inyecta createTableConfig desde los handlers;
      // `onExport` solo se puede fijar acá (la config base es estática).
      onExport,
    },
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 w-full">
        {/* Aggregates bar */}
        <MovimientoAggregates aggregates={aggregates} isLoading={isLoading} />

        {/* DataTable — server-side mode */}
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          isFetching={isFetching}
          config={config}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          sorting={sorting}
          onSortingChange={onSortingChange}
          onGlobalFilterChange={onGlobalFilterChange}
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
export function getMovimientoRowClassName(row: MovimientoListItemDto): string {
  return cn(row.tipo === "INGRESO" && "font-semibold");
}
