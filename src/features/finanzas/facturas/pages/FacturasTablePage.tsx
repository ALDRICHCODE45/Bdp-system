"use client";

import { useMemo, useCallback, useState } from "react";
import { PaginationState, SortingState, Table } from "@tanstack/react-table";
import { toast } from "sonner";
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
import type { PaginatedResult } from "@/core/shared/types/pagination.types";
import {
  FacturasAdvancedFilters,
  EMPTY_ADVANCED_FILTERS,
} from "../types/FacturasAdvancedFilters.type";
import { getFacturasForExportAction } from "../server/actions/getFacturasForExportAction";
import { exportFacturasToExcel } from "../helpers/exportFacturasToExcel";
import type { ExportOptions } from "@/core/shared/components/DataTable/ExportButton";
import type { FacturaDto } from "../server/dtos/FacturaDto.dto";
import { useFacturaStatusCounts } from "../hooks/useFacturaStatusCounts.hook";

const CreateFacturaSheet = dynamic(
  () =>
    import("../components/CreateFacturaSheet").then((mod) => ({
      default: mod.CreateFacturaSheet,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

interface FacturasTablePageProps {
  initialData?: PaginatedResult<FacturaDto>;
}

export function FacturasTablePage({ initialData }: FacturasTablePageProps) {
  // ── Modal / sheet state ──────────────────────────────────────────────────
  const { isOpen, openModal, closeModal } = useModalState();
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // ── Detail sheet ─────────────────────────────────────────────────────────
  const [selectedFactura, setSelectedFactura] = useState<FacturaDto | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // ── Bulk delete ──────────────────────────────────────────────────────────
  const [bulkDeleteState, setBulkDeleteState] = useState<{
    open: boolean;
    ids: string[];
  }>({ open: false, ids: [] });

  // ── Pagination / sorting / search ────────────────────────────────────────
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // ── Tab state ─────────────────────────────────────────────────────────────
  const [activeTabs, setActiveTabs] = useState<string[]>([]);
  // Pasar todos los tabs activos como array; el repositorio hace `status IN [...]`
  const status = activeTabs.length > 0 ? activeTabs : undefined;

  // ── Quick filters (multi-select, apply immediately) ───────────────────────
  const [metodoPagoFilter, setMetodoPagoFilter] = useState<string[]>([]);
  const [monedaFilter, setMonedaFilter] = useState<string[]>([]);
  const [statusPagoFilter, setStatusPagoFilter] = useState<string[]>([]);

  // ── Advanced filters (apply only on sheet "Aplicar") ─────────────────────
  const [advancedFilters, setAdvancedFilters] =
    useState<FacturasAdvancedFilters>(EMPTY_ADVANCED_FILTERS);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const resetPage = useCallback(
    () => setPagination((prev) => ({ ...prev, pageIndex: 0 })),
    []
  );

  const handleMultiTabChange = useCallback(
    (tabs: string[]) => { setActiveTabs(tabs); resetPage(); },
    [resetPage]
  );

  const handleViewDetail = useCallback((factura: FacturaDto) => {
    setSelectedFactura(factura);
    setDetailSheetOpen(true);
  }, []);

  const handlePaginationChange = useCallback(
    (p: PaginationState) => setPagination(p),
    []
  );

  const handleSortingChange = useCallback(
    (s: SortingState) => { setSorting(s); resetPage(); },
    [resetPage]
  );

  const handleGlobalFilterChange = useCallback(
    (value: string) => { setSearch(value); resetPage(); },
    [resetPage]
  );

  const handleBulkDelete = useCallback((rows: FacturaDto[]) => {
    setBulkDeleteState({ open: true, ids: rows.map((r) => r.id) });
  }, []);

  // Quick filter handlers
  const handleMetodoPagoChange = useCallback(
    (v: string[]) => { setMetodoPagoFilter(v); resetPage(); },
    [resetPage]
  );
  const handleMonedaChange = useCallback(
    (v: string[]) => { setMonedaFilter(v); resetPage(); },
    [resetPage]
  );
  const handleStatusPagoChange = useCallback(
    (v: string[]) => { setStatusPagoFilter(v); resetPage(); },
    [resetPage]
  );

  // Advanced filters — solo aplican cuando el usuario presiona "Aplicar" en el sheet
  const handleApplyAdvancedFilters = useCallback(
    (filters: FacturasAdvancedFilters) => {
      setAdvancedFilters(filters);
      resetPage();
    },
    [resetPage]
  );

  // Limpiar TODO
  const handleClearFilters = useCallback(() => {
    setMetodoPagoFilter([]);
    setMonedaFilter([]);
    setStatusPagoFilter([]);
    setAdvancedFilters(EMPTY_ADVANCED_FILTERS);
    setSearch("");
    resetPage();
  }, [resetPage]);

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExportFacturas = useCallback(
    async (table: Table<unknown>, options?: ExportOptions) => {
      if (options?.selectedOnly) {
        // Filas ya cargadas en memoria → exportar directamente
        const selected = table
          .getSelectedRowModel()
          .rows.map((r) => r.original as FacturaDto);

        if (selected.length === 0) {
          toast.error("No hay filas seleccionadas para exportar.");
          return;
        }

        exportFacturasToExcel(selected, "facturas_seleccionadas");
        toast.success(`${selected.length} facturas exportadas correctamente.`);
        return;
      }

      // Exportar todas / filtradas → traer del servidor con filtros activos
      const toastId = toast.loading("Preparando exportación...");

      const result = await getFacturasForExportAction({
        sortBy: sorting[0]?.id,
        sortOrder: sorting[0]?.desc ? "desc" : sorting[0] ? "asc" : undefined,
        search: debouncedSearch || undefined,
        status,
        // Quick filters
        metodoPago: metodoPagoFilter.length ? metodoPagoFilter : undefined,
        moneda: monedaFilter.length ? monedaFilter : undefined,
        statusPago: statusPagoFilter.length ? statusPagoFilter : undefined,
        // Advanced filters
        uuid: advancedFilters.uuid.length ? advancedFilters.uuid : undefined,
        usoCfdi: advancedFilters.usoCfdi.length ? advancedFilters.usoCfdi : undefined,
        rfcEmisor: advancedFilters.rfcEmisor.length ? advancedFilters.rfcEmisor : undefined,
        nombreEmisor: advancedFilters.nombreEmisor.length ? advancedFilters.nombreEmisor : undefined,
        rfcReceptor: advancedFilters.rfcReceptor.length ? advancedFilters.rfcReceptor : undefined,
        nombreReceptor: advancedFilters.nombreReceptor.length ? advancedFilters.nombreReceptor : undefined,
        subtotalMin: advancedFilters.subtotalMin ? parseFloat(advancedFilters.subtotalMin) : undefined,
        subtotalMax: advancedFilters.subtotalMax ? parseFloat(advancedFilters.subtotalMax) : undefined,
        totalMin: advancedFilters.totalMin ? parseFloat(advancedFilters.totalMin) : undefined,
        totalMax: advancedFilters.totalMax ? parseFloat(advancedFilters.totalMax) : undefined,
        impTrasladosMin: advancedFilters.impTrasladosMin ? parseFloat(advancedFilters.impTrasladosMin) : undefined,
        impTrasladosMax: advancedFilters.impTrasladosMax ? parseFloat(advancedFilters.impTrasladosMax) : undefined,
        impRetenidosMin: advancedFilters.impRetenidosMin ? parseFloat(advancedFilters.impRetenidosMin) : undefined,
        impRetenidosMax: advancedFilters.impRetenidosMax ? parseFloat(advancedFilters.impRetenidosMax) : undefined,
        fechaPagoFrom: advancedFilters.fechaPagoFrom || undefined,
        fechaPagoTo: advancedFilters.fechaPagoTo || undefined,
        ingresadoPor: advancedFilters.ingresadoPor.length ? advancedFilters.ingresadoPor : undefined,
        createdAtFrom: advancedFilters.createdAtFrom || undefined,
        createdAtTo: advancedFilters.createdAtTo || undefined,
        updatedAtFrom: advancedFilters.updatedAtFrom || undefined,
        updatedAtTo: advancedFilters.updatedAtTo || undefined,
      });

      if (!result.ok) {
        toast.dismiss(toastId);
        toast.error("Error al exportar las facturas.");
        return;
      }

      exportFacturasToExcel(result.data, "facturas");
      toast.dismiss(toastId);
      toast.success(`${result.data.length} facturas exportadas correctamente.`);
    },
    [
      sorting,
      debouncedSearch,
      status,
      metodoPagoFilter,
      monedaFilter,
      statusPagoFilter,
      advancedFilters,
    ]
  );

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data, isPending, isFetching } = useFacturas(
    {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      sortBy: sorting[0]?.id,
      sortOrder: sorting[0]?.desc ? "desc" : sorting[0] ? "asc" : undefined,
      search: debouncedSearch || undefined,
      status,
      // Quick filters
      metodoPago: metodoPagoFilter.length ? metodoPagoFilter : undefined,
      moneda: monedaFilter.length ? monedaFilter : undefined,
      statusPago: statusPagoFilter.length ? statusPagoFilter : undefined,
      // Advanced filters
      uuid: advancedFilters.uuid.length ? advancedFilters.uuid : undefined,
      usoCfdi: advancedFilters.usoCfdi.length ? advancedFilters.usoCfdi : undefined,
      rfcEmisor: advancedFilters.rfcEmisor.length ? advancedFilters.rfcEmisor : undefined,
      nombreEmisor: advancedFilters.nombreEmisor.length ? advancedFilters.nombreEmisor : undefined,
      rfcReceptor: advancedFilters.rfcReceptor.length ? advancedFilters.rfcReceptor : undefined,
      nombreReceptor: advancedFilters.nombreReceptor.length ? advancedFilters.nombreReceptor : undefined,
      subtotalMin: advancedFilters.subtotalMin ? parseFloat(advancedFilters.subtotalMin) : undefined,
      subtotalMax: advancedFilters.subtotalMax ? parseFloat(advancedFilters.subtotalMax) : undefined,
      totalMin: advancedFilters.totalMin ? parseFloat(advancedFilters.totalMin) : undefined,
      totalMax: advancedFilters.totalMax ? parseFloat(advancedFilters.totalMax) : undefined,
      impTrasladosMin: advancedFilters.impTrasladosMin ? parseFloat(advancedFilters.impTrasladosMin) : undefined,
      impTrasladosMax: advancedFilters.impTrasladosMax ? parseFloat(advancedFilters.impTrasladosMax) : undefined,
      impRetenidosMin: advancedFilters.impRetenidosMin ? parseFloat(advancedFilters.impRetenidosMin) : undefined,
      impRetenidosMax: advancedFilters.impRetenidosMax ? parseFloat(advancedFilters.impRetenidosMax) : undefined,
      fechaPagoFrom: advancedFilters.fechaPagoFrom || undefined,
      fechaPagoTo: advancedFilters.fechaPagoTo || undefined,
      ingresadoPor: advancedFilters.ingresadoPor.length ? advancedFilters.ingresadoPor : undefined,
      createdAtFrom: advancedFilters.createdAtFrom || undefined,
      createdAtTo: advancedFilters.createdAtTo || undefined,
      updatedAtFrom: advancedFilters.updatedAtFrom || undefined,
      updatedAtTo: advancedFilters.updatedAtTo || undefined,
    },
    initialData
  );

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = useMemo(
    () => createFacturasColumns(handleViewDetail),
    [handleViewDetail]
  );

  // ── Status counts (filtros activos sin status) ─────────────────────────────
  const countFilters = useMemo(() => ({
    search: debouncedSearch || undefined,
    metodoPago: metodoPagoFilter.length ? metodoPagoFilter : undefined,
    moneda: monedaFilter.length ? monedaFilter : undefined,
    statusPago: statusPagoFilter.length ? statusPagoFilter : undefined,
    uuid: advancedFilters.uuid.length ? advancedFilters.uuid : undefined,
    usoCfdi: advancedFilters.usoCfdi.length ? advancedFilters.usoCfdi : undefined,
    rfcEmisor: advancedFilters.rfcEmisor.length ? advancedFilters.rfcEmisor : undefined,
    nombreEmisor: advancedFilters.nombreEmisor.length ? advancedFilters.nombreEmisor : undefined,
    rfcReceptor: advancedFilters.rfcReceptor.length ? advancedFilters.rfcReceptor : undefined,
    nombreReceptor: advancedFilters.nombreReceptor.length ? advancedFilters.nombreReceptor : undefined,
    subtotalMin: advancedFilters.subtotalMin ? parseFloat(advancedFilters.subtotalMin) : undefined,
    subtotalMax: advancedFilters.subtotalMax ? parseFloat(advancedFilters.subtotalMax) : undefined,
    totalMin: advancedFilters.totalMin ? parseFloat(advancedFilters.totalMin) : undefined,
    totalMax: advancedFilters.totalMax ? parseFloat(advancedFilters.totalMax) : undefined,
    impTrasladosMin: advancedFilters.impTrasladosMin ? parseFloat(advancedFilters.impTrasladosMin) : undefined,
    impTrasladosMax: advancedFilters.impTrasladosMax ? parseFloat(advancedFilters.impTrasladosMax) : undefined,
    impRetenidosMin: advancedFilters.impRetenidosMin ? parseFloat(advancedFilters.impRetenidosMin) : undefined,
    impRetenidosMax: advancedFilters.impRetenidosMax ? parseFloat(advancedFilters.impRetenidosMax) : undefined,
    fechaPagoFrom: advancedFilters.fechaPagoFrom || undefined,
    fechaPagoTo: advancedFilters.fechaPagoTo || undefined,
    ingresadoPor: advancedFilters.ingresadoPor.length ? advancedFilters.ingresadoPor : undefined,
    createdAtFrom: advancedFilters.createdAtFrom || undefined,
    createdAtTo: advancedFilters.createdAtTo || undefined,
    updatedAtFrom: advancedFilters.updatedAtFrom || undefined,
    updatedAtTo: advancedFilters.updatedAtTo || undefined,
  }), [debouncedSearch, metodoPagoFilter, monedaFilter, statusPagoFilter, advancedFilters]);

  const { data: statusCounts } = useFacturaStatusCounts(countFilters);

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const tabsConfig = useMemo(
    () => enrichFacturaTabsWithCounts(activeTabs, statusCounts),
    [activeTabs, statusCounts]
  );

  // ── Table config ──────────────────────────────────────────────────────────
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
        customFilterProps: {
          metodoPago: metodoPagoFilter,
          onMetodoPagoChange: handleMetodoPagoChange,
          moneda: monedaFilter,
          onMonedaChange: handleMonedaChange,
          statusPago: statusPagoFilter,
          onStatusPagoChange: handleStatusPagoChange,
          onClearFilters: handleClearFilters,
          advancedFilters,
          onApplyAdvancedFilters: handleApplyAdvancedFilters,
          onExport: handleExportFacturas,
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
      advancedFilters,
      handleApplyAdvancedFilters,
      handleExportFacturas,
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

          {/* Detail sheet */}
          <FacturaDetailSheet
            factura={selectedFactura}
            open={detailSheetOpen}
            onOpenChange={setDetailSheetOpen}
          />

          {/* Bulk delete dialog */}
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
                  onClick={() =>
                    setBulkDeleteState({ open: false, ids: [] })
                  }
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
