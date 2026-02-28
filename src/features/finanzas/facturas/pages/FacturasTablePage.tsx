"use client";

import { useMemo, useCallback, useState } from "react";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { DataTableMultiTabs } from "@/core/shared/components/DataTable/DataTableMultiTabs";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import { FacturasTableConfig } from "../components/FacturasTableConfig";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { useFacturas } from "../hooks/useFacturas.hook";
import { useDebounce } from "@/core/shared/hooks/use-debounce";
import { Card, CardContent } from "@/core/shared/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/core/shared/ui/alert-dialog";
import { createFacturasColumns } from "../components/FacturasTableColumns";
import { FacturaDetailSheet } from "../components/FacturaDetailSheet";
import { enrichFacturaTabsWithCounts } from "../config/facturaTabsConfig";
import { ImportFacturasDialog } from "../components/import";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import type { FacturaDto } from "../server/dtos/FacturaDto.dto";
import type { PaginatedResult } from "@/core/shared/types/pagination.types";

const CreateFacturaSheet = dynamic(
  () =>
    import("../components/CreateFacturaSheet").then((mod) => ({
      default: mod.CreateFacturaSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

interface FacturasTablePageProps {
  initialData?: PaginatedResult<FacturaDto>;
}

export function FacturasTablePage({ initialData }: FacturasTablePageProps) {
  // ── modal state ──────────────────────────────────────────────────────────
  const { isOpen, openModal, closeModal } = useModalState();
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // ── detail sheet state ───────────────────────────────────────────────────
  const [selectedFactura, setSelectedFactura] = useState<FacturaDto | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // ── bulk delete state ────────────────────────────────────────────────────
  const [bulkDeleteState, setBulkDeleteState] = useState<{ open: boolean; ids: string[] }>({
    open: false,
    ids: [],
  });

  // ── table state ──────────────────────────────────────────────────────────
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // ── tab / filter state ───────────────────────────────────────────────────
  const [activeTabs, setActiveTabs] = useState<string[]>([]);
  // Filter values controlled by FacturasFilters component (server-side mode)
  const [metodoPagoFilter, setMetodoPagoFilter] = useState<string | undefined>();
  const [monedaFilter, setMonedaFilter] = useState<string | undefined>();
  const [statusPagoFilter, setStatusPagoFilter] = useState<string | undefined>();

  // ── derived filter values ─────────────────────────────────────────────────
  const status = activeTabs.length === 1 ? activeTabs[0] : undefined;

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleMultiTabChange = useCallback((tabs: string[]) => {
    setActiveTabs(tabs);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleViewDetail = useCallback((factura: FacturaDto) => {
    setSelectedFactura(factura);
    setDetailSheetOpen(true);
  }, []);

  const handlePaginationChange = useCallback((newPagination: PaginationState) => {
    setPagination(newPagination);
  }, []);

  const handleSortingChange = useCallback((newSorting: SortingState) => {
    setSorting(newSorting);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleGlobalFilterChange = useCallback((value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleBulkDelete = useCallback((rows: FacturaDto[]) => {
    setBulkDeleteState({ open: true, ids: rows.map((r) => r.id) });
  }, []);

  const handleMetodoPagoChange = useCallback((value: string) => {
    setMetodoPagoFilter(value || undefined);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleMonedaChange = useCallback((value: string) => {
    setMonedaFilter(value || undefined);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleStatusPagoChange = useCallback((value: string) => {
    setStatusPagoFilter(value || undefined);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setMetodoPagoFilter(undefined);
    setMonedaFilter(undefined);
    setStatusPagoFilter(undefined);
    setSearch("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  // ── data fetching ─────────────────────────────────────────────────────────
  const { data, isPending, isFetching } = useFacturas(
    {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      sortBy: sorting[0]?.id,
      sortOrder: sorting[0]?.desc ? "desc" : sorting[0] ? "asc" : undefined,
      search: debouncedSearch || undefined,
      status,
      metodoPago: metodoPagoFilter,
      moneda: monedaFilter,
      statusPago: statusPagoFilter,
    },
    initialData
  );

  // ── columns (memoized) ────────────────────────────────────────────────────
  const columns = useMemo(() => createFacturasColumns(handleViewDetail), [handleViewDetail]);

  // ── tabs config ───────────────────────────────────────────────────────────
  const totalCount = data?.totalCount ?? 0;
  const tabsConfig = useMemo(
    () => enrichFacturaTabsWithCounts(activeTabs, totalCount),
    [activeTabs, totalCount]
  );

  // ── table config ──────────────────────────────────────────────────────────
  const tableConfig = useMemo(
    () =>
      createTableConfig(FacturasTableConfig, {
        onAdd: openModal,
        onImport: () => setImportDialogOpen(true),
        onBulkDelete: handleBulkDelete,
        serverSide: {
          enabled: true,
          totalCount: data?.totalCount ?? 0,
          pageCount: data?.pageCount ?? 0,
        },
        // Pasar los filtros controlados al componente FacturasFilters
        customFilterProps: {
          metodoPago: metodoPagoFilter,
          onMetodoPagoChange: handleMetodoPagoChange,
          moneda: monedaFilter,
          onMonedaChange: handleMonedaChange,
          statusPago: statusPagoFilter,
          onStatusPagoChange: handleStatusPagoChange,
          onClearFilters: handleClearFilters,
        },
      }),
    [
      openModal,
      data?.totalCount,
      data?.pageCount,
      handleBulkDelete,
      metodoPagoFilter,
      handleMetodoPagoChange,
      monedaFilter,
      handleMonedaChange,
      statusPagoFilter,
      handleStatusPagoChange,
      handleClearFilters,
    ]
  );

  return (
    <Card className="p-2 m-1">
      <CardContent>
        <div className="space-y-6">
          <TablePresentation
            subtitle="Administra y gestiona las facturas de tu empresa"
            title="Gestión de Facturas"
          />

          <DataTableMultiTabs
            tabs={tabsConfig}
            activeTabs={activeTabs}
            onTabsChange={handleMultiTabChange}
          />

          <PermissionGuard
            permissions={[
              PermissionActions.facturas.acceder,
              PermissionActions.facturas.gestionar,
            ]}
          >
            <DataTable
              columns={columns}
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
          </PermissionGuard>

          {/* Create sheet */}
          <PermissionGuard
            permissions={[
              PermissionActions.facturas.crear,
              PermissionActions.facturas.gestionar,
            ]}
          >
            {isOpen && <CreateFacturaSheet isOpen={true} onClose={closeModal} />}
            <ImportFacturasDialog
              open={importDialogOpen}
              onOpenChange={setImportDialogOpen}
            />
          </PermissionGuard>

          {/* Detail Sheet */}
          <FacturaDetailSheet
            factura={selectedFactura}
            open={detailSheetOpen}
            onOpenChange={setDetailSheetOpen}
          />

          {/* Bulk Delete Dialog */}
          <AlertDialog
            open={bulkDeleteState.open}
            onOpenChange={(open) =>
              setBulkDeleteState((prev) => ({ ...prev, open }))
            }
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ¿Eliminar {bulkDeleteState.ids.length} factura
                  {bulkDeleteState.ids.length !== 1 ? "s" : ""}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminarán permanentemente
                  las facturas seleccionadas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    // TODO: implement bulk delete action
                    setBulkDeleteState({ open: false, ids: [] });
                  }}
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
