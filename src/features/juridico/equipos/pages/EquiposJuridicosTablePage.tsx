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

import { useEquiposJuridicos } from "../hooks/useEquiposJuridicos.hook";
import { getEquiposJuridicosColumns } from "../components/EquiposJuridicosTableColumns";
import { EquiposJuridicosTableConfig } from "../components/EquiposJuridicosTableConfig";
import { EquipoJuridicoDetailSheet } from "../components/EquipoJuridicoDetailSheet";
import { EquipoJuridicoMobileView } from "../components/mobile/EquipoJuridicoMobileView";
import type { EquipoJuridicoDto } from "../server/dtos/EquipoJuridicoDto.dto";

const CreateEquipoJuridicoSheet = dynamic(
  () =>
    import("../components/CreateEquipoJuridicoSheet").then((mod) => ({
      default: mod.CreateEquipoJuridicoSheet,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

export function EquiposJuridicosTablePage() {
  const isMobile = useIsMobile();

  // ── Modal state ──────────────────────────────────────────────────────────
  const { isOpen, openModal, closeModal } = useModalState();

  // ── Detail sheet state ────────────────────────────────────────────────────
  const [selectedEquipo, setSelectedEquipo] =
    useState<EquipoJuridicoDto | null>(null);
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

  const handleViewDetail = useCallback((equipo: EquipoJuridicoDto) => {
    setSelectedEquipo(equipo);
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
  const { data, isPending, isFetching } = useEquiposJuridicos({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? "desc" : sorting[0] ? "asc" : undefined,
    search: debouncedSearch || undefined,
  });

  // ── Data fetching — mobile ────────────────────────────────────────────────
  const { data: mobileData, isPending: isMobilePending } = useEquiposJuridicos(
    {
      page: mobilePage,
      pageSize: 20,
      search: debouncedMobileSearch || undefined,
    }
  );

  // ── Columns (memoized with onViewDetail) ──────────────────────────────────
  const columns = useMemo(
    () => getEquiposJuridicosColumns(handleViewDetail),
    [handleViewDetail]
  );

  // ── Table config ──────────────────────────────────────────────────────────
  const tableConfig = useMemo(
    () =>
      createTableConfig(EquiposJuridicosTableConfig, {
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
          PermissionActions["juridico-equipos"].crear,
          PermissionActions["juridico-equipos"].gestionar,
        ]}
      >
        {isOpen && (
          <CreateEquipoJuridicoSheet isOpen={true} onClose={closeModal} />
        )}
      </PermissionGuard>

      <EquipoJuridicoDetailSheet
        equipo={selectedEquipo}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </>
  );

  // ── Mobile view ───────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <EquipoJuridicoMobileView
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
            title="Equipos Jurídicos"
            subtitle="Administra los equipos del área jurídica y sus miembros"
          />

          <PermissionGuard
            permissions={[
              PermissionActions["juridico-equipos"].acceder,
              PermissionActions["juridico-equipos"].gestionar,
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

          {sharedModals}
        </div>
      </CardContent>
    </Card>
  );
}
