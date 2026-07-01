"use client";

import { useMemo, useState, useCallback } from "react";
import { PaginationState, SortingState, Table } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  Card,
  CardContent,
} from "@/core/shared/ui/card";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { DataTableMultiTabs } from "@/core/shared/components/DataTable/DataTableMultiTabs";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import { ColaboradoresTableConfig } from "../components/ColaboradoresTableConfig";
import { ColaboradoresCardsView } from "../components/ColaboradoresCardsView";
import { colaboradoresColumns } from "../components/ColaboradoresTableColumns";
import {
  enrichColaboradorTabsWithCounts,
  tabIdsToStatusFilter,
} from "../config/colaboradorTabsConfig";
import { useColaboradores } from "../hooks/useColaboradores.hook";
import { useColaboradorStatusCounts } from "../hooks/useColaboradorStatusCounts.hook";
import { getColaboradoresForExportAction } from "../server/actions/getColaboradoresForExportAction";
import { exportColaboradoresToExcel } from "../helpers/exportColaboradoresToExcel";
import type { ExportOptions } from "@/core/shared/components/DataTable/ExportButton";
import type { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import type { ColaboradoresViewMode } from "../components/ColaboradoresTableFilters";
import type { ColaboradoresFilterParams } from "../types/ColaboradoresFilterParams";

export function ColaboradoresTablePage() {
  // ── Pagination / sorting ───────────────────────────────────────────────
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  // ── Search (already debounced 300ms by ColaboradoresTableFilters) ─────
  // El filtro emite el valor debounceado vía onGlobalFilterChange; lo
  // almacenamos tal cual y lo mandamos al server. NO debounc acá — duplicar
  // la espera serial elevaba el delay efectivo a ~600ms (cap1 req3: 300ms).
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ── Tabs (cap1 req2: Todos / Activos / En licencia) ────────────────────
  const [activeTabs, setActiveTabs] = useState<string[]>([]);
  // Memoized: `tabIdsToStatusFilter` returns a NEW array each call. Without
  // memoization it destabilizes every downstream useMemo/useCallback that
  // depends on `status` (handleExport → tableConfig), which in server-side
  // mode cascades into a setState loop ("Maximum update depth exceeded").
  const status = useMemo(() => tabIdsToStatusFilter(activeTabs), [activeTabs]);

  // ── Cards vs Tabla toggle (cap1 req4) ─────────────────────────────────
  const [viewMode, setViewMode] = useState<ColaboradoresViewMode>("tabla");

  // ── Tab counts ─────────────────────────────────────────────────────────
  const { data: statusCounts } = useColaboradorStatusCounts();
  const tabsConfig = useMemo(
    () => enrichColaboradorTabsWithCounts(activeTabs, statusCounts),
    [activeTabs, statusCounts],
  );

  // ── Reset page index whenever filters change ──────────────────────────
  const resetPage = useCallback(
    () => setPagination((prev) => ({ ...prev, pageIndex: 0 })),
    [],
  );

  const handleMultiTabChange = useCallback(
    (tabs: string[]) => {
      setActiveTabs(tabs);
      resetPage();
    },
    [resetPage],
  );

  const handlePaginationChange = useCallback(
    (p: PaginationState) => setPagination(p),
    [],
  );

  const handleSortingChange = useCallback(
    (s: SortingState) => {
      setSorting(s);
      resetPage();
    },
    [resetPage],
  );

  const handleGlobalFilterChange = useCallback(
    (value: string) => {
      setDebouncedSearch(value);
      resetPage();
    },
    [resetPage],
  );

  // ── Server query (server-side pagination + filters) ───────────────────
  const params: ColaboradoresFilterParams = {
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? "desc" : sorting[0] ? "asc" : undefined,
    search: debouncedSearch || undefined,
    status,
  };

  const { data, isPending, isFetching } = useColaboradores(params);

  // ── Table config (mirrors Facturas customFilter pattern) ──────────────
  const handleExport = useCallback(
    async (_table: Table<unknown>, _options?: ExportOptions) => {
      const toastId = toast.loading("Preparando exportación...");
      const result = await getColaboradoresForExportAction({
        status,
        search: debouncedSearch || undefined,
      });
      if (!result.ok) {
        toast.dismiss(toastId);
        toast.error("Error al exportar los colaboradores.");
        return;
      }
      // Cap1 req5: export honors the active tab filter — the server already
      // received `status` (filtered by tab) so result.data is correct.
      exportColaboradoresToExcel(
        result.data,
        status && status.length > 0 ? `colaboradores_${status.join("_")}` : "colaboradores",
      );
      toast.dismiss(toastId);
      toast.success(
        `${result.data.length} colaboradores exportados correctamente.`,
      );
    },
    [status, debouncedSearch],
  );

  const tableConfig = useMemo(
    () =>
      createTableConfig(ColaboradoresTableConfig, {
        // Server-side pagination
        serverSide: {
          enabled: true,
          totalCount: data?.totalCount ?? 0,
          pageCount: data?.pageCount ?? 0,
        },
        customFilterProps: {
          viewMode,
          onViewModeChange: setViewMode,
          totalCount: data?.totalCount,
          onExport: handleExport,
          // onImport intencionalmente omitido en P1 — la importación masiva
          // se aborda en fases posteriores; el botón no se renderiza.
        },
      }),
    [data?.totalCount, data?.pageCount, handleExport, viewMode],
  );

  return (
    <Card className="p-2 m-1">
      <CardContent>
        <div className="space-y-6">
          <TablePresentation
            subtitle="Administra y gestiona los colaboradores de tu empresa"
            title="Gestión de Colaboradores"
          />

          {/* ── Tabs (Todos / Activos / En licencia) ─────────────────────── */}
          <DataTableMultiTabs
            tabs={tabsConfig}
            activeTabs={activeTabs}
            onTabsChange={handleMultiTabChange}
          />

          <PermissionGuard
            permissions={[
              PermissionActions.colaboradores.acceder,
              PermissionActions.colaboradores.gestionar,
            ]}
          >
            {/* ── Cards view (tab=Tabla/Cards controlled from filter) ─────── */}
            {viewMode === "cards" ? (
              <div className="space-y-4">
                <ColaboradoresCardsView
                  data={(data?.data ?? []) as ColaboradorDto[]}
                />
                {/* Cards view pagination controls — read-only summary */}
                {data && data.totalCount > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
                    <span>
                      Mostrando{" "}
                      <strong>
                        {pagination.pageIndex * pagination.pageSize + 1}–
                        {Math.min(
                          (pagination.pageIndex + 1) * pagination.pageSize,
                          data.totalCount,
                        )}
                      </strong>{" "}
                      de <strong>{data.totalCount}</strong>
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={pagination.pageIndex === 0}
                        onClick={() =>
                          setPagination((p) => ({
                            ...p,
                            pageIndex: p.pageIndex - 1,
                          }))
                        }
                        className="px-2 py-1 border rounded disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <button
                        type="button"
                        disabled={
                          pagination.pageIndex + 1 >= (data.pageCount ?? 1)
                        }
                        onClick={() =>
                          setPagination((p) => ({
                            ...p,
                            pageIndex: p.pageIndex + 1,
                          }))
                        }
                        className="px-2 py-1 border rounded disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <DataTable
                columns={colaboradoresColumns}
                data={data?.data ?? []}
                config={tableConfig}
                isLoading={isPending && !data}
                isFetching={isFetching && !!data}
                pagination={pagination}
                sorting={sorting}
                onPaginationChange={handlePaginationChange}
                onSortingChange={handleSortingChange}
                onGlobalFilterChange={handleGlobalFilterChange}
              />
            )}
          </PermissionGuard>
        </div>
      </CardContent>
    </Card>
  );
}