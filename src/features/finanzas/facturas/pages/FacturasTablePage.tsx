"use client";

import { useEffect, useMemo, useState } from "react";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { columns } from "../components/FacturasTableColumns";
import { FacturasTableConfig } from "../components/FacturasTableConfig";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { ImportFacturasDialog } from "../components/import";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { useFacturas } from "../hooks/useFacturas.hook";
import { useDebounce } from "@/core/shared/hooks/use-debounce";

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

export function FacturasTablePage() {
  const { isOpen, openModal, closeModal } = useModalState();
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const tableConfig = useMemo(
    () =>
      createTableConfig(FacturasTableConfig, {
        onAdd: () => openModal(),
        onImport: () => setImportDialogOpen(true),
      }),
    [openModal]
  );

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: tableConfig.pagination?.defaultPageSize ?? 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Extract filter values from columnFilters state
  const searchValue =
    (columnFilters.find((f) => f.id === "search")?.value as string) ?? "";
  const debouncedSearch = useDebounce(searchValue, 300);

  const statusFilter =
    (columnFilters.find((f) => f.id === "status")?.value as string) ?? undefined;
  const metodoPagoFilter =
    (columnFilters.find((f) => f.id === "metodoPago")?.value as string) ?? undefined;
  const monedaFilter =
    (columnFilters.find((f) => f.id === "moneda")?.value as string) ?? undefined;
  const statusPagoFilter =
    (columnFilters.find((f) => f.id === "statusPago")?.value as string) ?? undefined;
  const totalRange =
    (columnFilters.find((f) => f.id === "total")?.value as { min?: number; max?: number }) ?? undefined;

  // Reset pagination when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch, statusFilter, metodoPagoFilter, monedaFilter, statusPagoFilter, totalRange]);

  const { data, isPending, isFetching } = useFacturas({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? "desc" : sorting[0] ? "asc" : undefined,
    search: debouncedSearch || undefined,
    status: statusFilter,
    metodoPago: metodoPagoFilter,
    moneda: monedaFilter,
    statusPago: statusPagoFilter,
    totalMin: totalRange?.min,
    totalMax: totalRange?.max,
  });

  const serverConfig = useMemo(
    () => ({
      ...tableConfig,
      pagination: {
        ...tableConfig.pagination,
        manualPagination: true,
        pageCount: data?.pageCount ?? 0,
        totalCount: data?.totalCount ?? 0,
        onPaginationChange: setPagination,
      },
      manualSorting: true,
      onSortingChange: setSorting,
      manualFiltering: true,
      onColumnFiltersChange: setColumnFilters,
    }),
    [tableConfig, data?.pageCount, data?.totalCount]
  );

  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra y gestiona las facturas de tu empresa"
        title="Gestion de Facturas"
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
          config={serverConfig}
          isLoading={isPending}
        />
      </PermissionGuard>

      <PermissionGuard
        permissions={[
          PermissionActions.facturas.crear,
          PermissionActions.facturas.gestionar,
        ]}
      >
        {isOpen && <CreateFacturaSheet isOpen={true} onClose={closeModal} />}
      </PermissionGuard>

      <PermissionGuard
        permissions={[
          PermissionActions.facturas.crear,
          PermissionActions.facturas.gestionar,
        ]}
      >
        <ImportFacturasDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
        />
      </PermissionGuard>
    </div>
  );
}
