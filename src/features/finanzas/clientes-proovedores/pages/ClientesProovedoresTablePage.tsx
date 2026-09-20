"use client";
import { useCallback, useMemo, useState } from "react";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { createClientesProveedoresColumns } from "../components/ClientesProveedoresTableColumns";
import { ClienteProveedorDetailSheet } from "../components/ClienteProveedorDetailSheet";
import { ClientesProovedoresTableConfig } from "../components/ClientesProovedoresTableConfig";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { Card, CardContent } from "@/core/shared/ui/card";
import { useClientesProveedoresPaginated } from "../hooks/useClientesProveedoresPaginated.hook";
import { useClientesProovedoresTableFilters } from "../hooks/useClientesProovedoresTableFilters.hook";
import type { ClienteProveedorDto } from "../server/dtos/ClienteProveedorDto.dto";

const CreateClienteProveedorSheet = dynamic(
  () =>
    import("../components/CreateClienteProveedorSheet").then((mod) => ({
      default: mod.CreateClienteProveedorSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  },
);

export const ClientesProovedoresTablePage = () => {
  const { isOpen, openModal, closeModal } = useModalState();

  // ── Detail sheet ────────────────────────────────────────────────────────
  const [selectedClienteProveedor, setSelectedClienteProveedor] =
    useState<ClienteProveedorDto | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  const handleViewDetail = useCallback(
    (clienteProveedor: ClienteProveedorDto) => {
      setSelectedClienteProveedor(clienteProveedor);
      setDetailSheetOpen(true);
    },
    [],
  );

  const columns = useMemo(
    () => createClientesProveedoresColumns(handleViewDetail),
    [handleViewDetail],
  );

  // ── Pagination / sorting ────────────────────────────────────────────────
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: ClientesProovedoresTableConfig.pagination?.defaultPageSize ?? 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const resetPage = useCallback(
    () => setPagination((prev) => ({ ...prev, pageIndex: 0 })),
    [],
  );

  // ── Filters (server-side) ───────────────────────────────────────────────
  // Every filter/search change resets to page 1.
  const {
    search,
    selectedTipo,
    selectedEstado,
    selectedBanco,
    socioResponsableFilter,
    selectedDateRange,
    filterParams,
    handleSearchChange,
    handleTipoChange,
    handleEstadoChange,
    handleBancoChange,
    handleSocioResponsableChange,
    handleDateRangeChange,
    clearFilters,
  } = useClientesProovedoresTableFilters({ onFiltersChange: resetPage });

  const handlePaginationChange = useCallback(
    (nextPagination: PaginationState) => setPagination(nextPagination),
    [],
  );

  const handleSortingChange = useCallback(
    (nextSorting: SortingState) => {
      setSorting(nextSorting);
      resetPage();
    },
    [resetPage],
  );

  // ── Data fetching ───────────────────────────────────────────────────────
  const { data, isPending, isFetching } = useClientesProveedoresPaginated({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? "desc" : sorting[0] ? "asc" : undefined,
    ...filterParams,
  });

  // ── Table config (server-side pagination, sorting and filtering) ────────
  const serverConfig = useMemo(
    () =>
      createTableConfig(ClientesProovedoresTableConfig, {
        onAdd: openModal,
        serverSide: {
          enabled: true,
          totalCount: data?.totalCount ?? 0,
          pageCount: data?.pageCount ?? 0,
        },
        customFilterProps: {
          search,
          selectedTipo,
          selectedEstado,
          selectedBanco,
          socioResponsableFilter,
          selectedDateRange,
          totalCount: data?.totalCount ?? 0,
          onSearchChange: handleSearchChange,
          onTipoChange: handleTipoChange,
          onEstadoChange: handleEstadoChange,
          onBancoChange: handleBancoChange,
          onSocioResponsableChange: handleSocioResponsableChange,
          onDateRangeChange: handleDateRangeChange,
          onClearFilters: clearFilters,
        },
      }),
    [
      openModal,
      data?.totalCount,
      data?.pageCount,
      search,
      selectedTipo,
      selectedEstado,
      selectedBanco,
      socioResponsableFilter,
      selectedDateRange,
      handleSearchChange,
      handleTipoChange,
      handleEstadoChange,
      handleBancoChange,
      handleSocioResponsableChange,
      handleDateRangeChange,
      clearFilters,
    ],
  );

  const tableConfig = useMemo(
    () => ({
      ...serverConfig,
      pagination: {
        ...serverConfig.pagination,
        manualPagination: true,
        pageCount: data?.pageCount ?? 0,
        totalCount: data?.totalCount ?? 0,
      },
    }),
    [serverConfig, data?.pageCount, data?.totalCount],
  );

  return (
    <Card className="p-2 m-1">
      <CardContent>
        <div className="space-y-6">
          <TablePresentation
            subtitle="Administra los clientes y los proveedores"
            title="Clientes y Proveedores"
          />

          <PermissionGuard
            permissions={[
              PermissionActions["clientes-proovedores"].acceder,
              PermissionActions["clientes-proovedores"].gestionar,
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
            />
          </PermissionGuard>

          {/* Modal con lazy loading */}

          <PermissionGuard
            permissions={[
              PermissionActions["clientes-proovedores"].crear,
              PermissionActions["clientes-proovedores"].gestionar,
            ]}
          >
            {isOpen && (
              <CreateClienteProveedorSheet isOpen={true} onClose={closeModal} />
            )}
          </PermissionGuard>

          {/* Detail sheet */}
          <ClienteProveedorDetailSheet
            key={selectedClienteProveedor?.id ?? "empty"}
            clienteProveedor={selectedClienteProveedor}
            open={detailSheetOpen}
            onOpenChange={setDetailSheetOpen}
          />
        </div>
      </CardContent>
    </Card>
  );
};
