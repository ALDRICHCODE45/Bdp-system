"use client";

import { Table } from "@tanstack/react-table";
import { Search, FileSpreadsheet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ExportOptions } from "@/core/shared/components/DataTable/ExportButton";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/core/shared/ui/card";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import { useDebounce } from "@/core/shared/hooks/use-debounce";
import { BaseFilterProps } from "@/core/shared/components/DataTable/types";
import { ColumnVisibilitySelector } from "@/core/shared/components/DataTable/ColumnVisibilitySelector";

export type ColaboradoresViewMode = "tabla" | "cards";

/**
 * Filter component for the slim colaboradores table (P1, cap1).
 *
 * - Search input (debounced 300ms over name + correo + puesto on the server)
 * - Importar (left as a no-op stub — bulk import from Excel is not in P1 scope;
 *   wired through so the button shape is consistent with Facturas)
 * - Exportar button that honors the active tab filter
 *
 * NOTE: the Tabla/Cards view toggle lives in the PAGE header (not here), so it
 * stays reachable in the cards view where this filter bar is not rendered.
 */
interface ColaboradoresTableFiltersProps extends BaseFilterProps {
  table: Table<unknown>;
  /** Called with the latest debounced search term (caller forwards to server). */
  onGlobalFilterChange?: (value: string) => void;
  /** Total row count (current page for table, or full count for cards). */
  totalCount?: number;
  /** Export handler. Receives the table and ExportOptions. */
  onExport?: (table: Table<unknown>, options?: ExportOptions) => void;
  /** Import handler. Optional — if absent, the button is hidden. */
  onImport?: () => void;
}

export function ColaboradoresTableFilters({
  table,
  onGlobalFilterChange,
  totalCount,
  onExport,
  onImport,
}: ColaboradoresTableFiltersProps) {
  // ── Debounced search (cap1 req3: 300ms over name+correo+puesto) ────────
  const [searchValue, setSearchValue] = useState<string>("");
  const debouncedSearch = useDebounce(searchValue, 300);

  // Re-emit debounced value to caller — server-driven, so caller forwards via
  // onGlobalFilterChange.
  //
  // IMPORTANT — infinite-loop guard:
  //   `onGlobalFilterChange` is `DataTable`'s `setGlobalFilter`, which is NOT
  //   memoized and therefore gets a fresh identity on every render. If it were
  //   part of this effect's dependency array, the effect would re-run every
  //   render, call setGlobalFilter → the page's handler (setDebouncedSearch +
  //   resetPage, which returns a NEW pagination object) → re-render → new
  //   setGlobalFilter identity → effect again … producing "Maximum update depth
  //   exceeded". We keep the callback in a ref and only emit when the debounced
  //   VALUE actually changes (skipping the initial empty mount).
  const onGlobalFilterChangeRef = useRef(onGlobalFilterChange);
  onGlobalFilterChangeRef.current = onGlobalFilterChange;

  const lastEmittedSearch = useRef<string | null>(null);
  useEffect(() => {
    if (lastEmittedSearch.current === debouncedSearch) return;
    lastEmittedSearch.current = debouncedSearch;
    onGlobalFilterChangeRef.current?.(debouncedSearch);
  }, [debouncedSearch]);

  const rowCount = totalCount ?? table.getRowCount();

  return (
    <Card className="mb-6 w-full min-w-0 overflow-hidden">
      <CardHeader className="pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Search className="h-5 w-5 text-primary flex-shrink-0" />
          <Badge variant="outline" className="flex-shrink-0">
            {rowCount} resultados
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto min-w-0">
          {onImport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onImport}
              className="h-8 px-3 flex items-center gap-1"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Importar</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={!onExport}
            onClick={() => onExport?.(table, { filteredOnly: true })}
            className="h-8 px-3 flex items-center gap-1"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
          <ColumnVisibilitySelector table={table} />
          {/* View toggle moved to the page header so it stays visible in the
              cards view too (this filter bar only renders in the tabla view). */}
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-3 px-4 sm:px-6 w-full min-w-0">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
          {/* Búsqueda global (debounced 300ms → server-side filter) */}
          <div className="space-y-2 w-full min-w-0 sm:col-span-2 lg:col-span-1">
            <Label htmlFor="colaboradores-search" className="text-xs font-medium">
              Búsqueda
            </Label>
            <div className="relative w-full min-w-0">
              <Input
                id="colaboradores-search"
                className="w-full pl-9 min-w-0"
                placeholder="Buscar por nombre, correo o cargo..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}