"use client";

import { useState, useCallback, useMemo } from "react";
import { PaginationState, SortingState } from "@tanstack/react-table";

import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import { useDebounce } from "@/core/shared/hooks/use-debounce";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { Card, CardContent } from "@/core/shared/ui/card";
import dynamic from "next/dynamic";

import { useClientesJuridicos } from "../hooks/useClientesJuridicos.hook";
import { clientesJuridicosColumns } from "../components/ClientesJuridicosTableColumns";
import { ClientesJuridicosTableConfig } from "../components/ClientesJuridicosTableConfig";
import { ClienteJuridicoDetailSheet } from "../components/ClienteJuridicoDetailSheet";
import { ClienteJuridicoMobileView } from "../components/mobile/ClienteJuridicoMobileView";
import type { ClienteJuridicoDto } from "../server/dtos/ClienteJuridicoDto.dto";

const CreateClienteJuridicoSheet = dynamic(
  () =>
    import("../components/CreateClienteJuridicoSheet").then((mod) => ({
      default: mod.CreateClienteJuridicoSheet,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

export function ClientesJuridicosTablePage() {
  const isMobile = useIsMobile();

  // ── Modal state ──────────────────────────────────────────────────────────
  const { isOpen, openModal, closeModal } = useModalState();

  // ── Detail sheet state ────────────────────────────────────────────────────
  const [selectedCliente, setSelectedCliente] =
    useState<ClienteJuridicoDto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ── Desktop: pagination / sorting / search ────────────────────────────────
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // ── Mobile: separate state ────────────────────────────────────────────────
  const [mobilePage, setMobilePage] = useState(1);
  const [mobileSearch, setMobileSearch] = useState("");
  const debouncedMobileSearch = useDebounce(mobileSearch, 300);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const resetPage = useCallback(
    () => setPagination((prev) => ({ ...prev, pageIndex: 0 })),
    []
  );

  const handleViewDetail = useCallback((cliente: ClienteJuridicoDto) => {
    setSelectedCliente(cliente);
    setIsDetailOpen(true);
  }, []);

  const handlePaginationChange = useCallback(
    (p: PaginationState) => setPagination(p),
    []
  );

  const handleSortingChange = useCallback(
    (s: SortingState) => {
      setSorting(s);
      resetPage();
    },
    [resetPage]
  );

  const handleGlobalFilterChange = useCallback(
    (value: string) => {
      setSearch(value);
      resetPage();
    },
    [resetPage]
  );

  const handleMobilePageChange = useCallback((page: number) => {
    setMobilePage(page);
  }, []);

  const handleMobileSearchChange = useCallback((value: string) => {
    setMobileSearch(value);
    setMobilePage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setMobileSearch("");
    setMobilePage(1);
  }, []);

  // ── Data fetching — desktop ───────────────────────────────────────────────
  const { data, isPending, isFetching } = useClientesJuridicos({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? "desc" : sorting[0] ? "asc" : undefined,
    search: debouncedSearch || undefined,
  });

  // ── Data fetching — mobile ────────────────────────────────────────────────
  const { data: mobileData, isPending: isMobilePending } = useClientesJuridicos(
    {
      page: mobilePage,
      pageSize: 20,
      search: debouncedMobileSearch || undefined,
    }
  );

  // ── Table config ──────────────────────────────────────────────────────────
  const tableConfig = useMemo(
    () =>
      createTableConfig(ClientesJuridicosTableConfig, {
        onAdd: openModal,
        serverSide: {
          enabled: true,
          totalCount: data?.totalCount ?? 0,
          pageCount: data?.pageCount ?? 0,
        },
      }),
    [openModal, data?.totalCount, data?.pageCount]
  );

  // ── Shared modals ─────────────────────────────────────────────────────────
  const sharedModals = (
    <>
      <PermissionGuard
        permissions={[
          PermissionActions["juridico-clientes"].crear,
          PermissionActions["juridico-clientes"].gestionar,
        ]}
      >
        {isOpen && (
          <CreateClienteJuridicoSheet isOpen={true} onClose={closeModal} />
        )}
      </PermissionGuard>

      <ClienteJuridicoDetailSheet
        cliente={selectedCliente}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </>
  );

  // ── Mobile view ───────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <ClienteJuridicoMobileView
          data={mobileData}
          isLoading={isMobilePending && !mobileData}
          onCreateClick={openModal}
          onViewDetail={handleViewDetail}
          page={mobilePage}
          onPageChange={handleMobilePageChange}
          search={mobileSearch}
          onSearchChange={handleMobileSearchChange}
          onClearFilters={handleClearFilters}
        />
        {sharedModals}
      </>
    );
  }

  // ── Desktop view ──────────────────────────────────────────────────────────
  return (
    <Card className="p-2 m-1">
      <CardContent>
        <div className="space-y-6">
          <TablePresentation
            title="Clientes Jurídicos"
            subtitle="Administra los clientes del área jurídica"
          />

          <PermissionGuard
            permissions={[
              PermissionActions["juridico-clientes"].acceder,
              PermissionActions["juridico-clientes"].gestionar,
            ]}
          >
            <DataTable
              columns={clientesJuridicosColumns}
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

          {sharedModals}
        </div>
      </CardContent>
    </Card>
  );
}
