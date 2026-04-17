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

import { useRegistrosHoras } from "../hooks/useRegistrosHoras.hook";
import { registroHorasColumns } from "../components/RegistroHorasTableColumns";
import { RegistroHorasTableConfig } from "../components/RegistroHorasTableConfig";
import { RegistroHoraDetailSheet } from "../components/RegistroHoraDetailSheet";
import { RegistroHoraMobileView } from "../components/mobile/RegistroHoraMobileView";
import { AutorizacionesTable } from "../components/AutorizacionesTable";
import { getCurrentWeekInfo } from "@/core/shared/helpers/weekUtils";
import type { RegistroHoraDto } from "../server/dtos/RegistroHoraDto.dto";

const CreateRegistroHoraSheet = dynamic(
  () =>
    import("../components/CreateRegistroHoraSheet").then((mod) => ({
      default: mod.CreateRegistroHoraSheet,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

interface RegistroHorasTablePageProps {
  isAdmin?: boolean;
}

export function RegistroHorasTablePage({
  isAdmin = false,
}: RegistroHorasTablePageProps) {
  const isMobile = useIsMobile();
  const currentWeekInfo = getCurrentWeekInfo();

  // ── Modal state ──────────────────────────────────────────────────────────
  const { isOpen, openModal, closeModal } = useModalState();

  // ── Detail sheet state ────────────────────────────────────────────────────
  const [selectedRegistro, setSelectedRegistro] =
    useState<RegistroHoraDto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ── Desktop: pagination / sorting / search / filters ─────────────────────
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Desktop filters (managed via search bar for now)
  const [desktopEquipo] = useState<string | undefined>();
  const [desktopCliente] = useState<string | undefined>();
  const [desktopAno] = useState<number | undefined>();

  // ── Mobile: separate state ────────────────────────────────────────────────
  const [mobilePage, setMobilePage] = useState(1);
  const [mobileSearch, setMobileSearch] = useState("");
  const debouncedMobileSearch = useDebounce(mobileSearch, 300);
  const [mobileEquipo, setMobileEquipo] = useState<string | undefined>();
  const [mobileCliente, setMobileCliente] = useState<string | undefined>();
  const [mobileAno, setMobileAno] = useState<number | undefined>();

  // ── Handlers ──────────────────────────────────────────────────────────────
  const resetPage = useCallback(
    () => setPagination((prev) => ({ ...prev, pageIndex: 0 })),
    []
  );

  const handleViewDetail = useCallback((registro: RegistroHoraDto) => {
    setSelectedRegistro(registro);
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

  const handleMobileEquipoChange = useCallback(
    (id: string | undefined) => {
      setMobileEquipo(id);
      setMobilePage(1);
    },
    []
  );

  const handleMobileClienteChange = useCallback(
    (id: string | undefined) => {
      setMobileCliente(id);
      setMobilePage(1);
    },
    []
  );

  const handleMobileAnoChange = useCallback((ano: number | undefined) => {
    setMobileAno(ano);
    setMobilePage(1);
  }, []);

  const handleMobileClearFilters = useCallback(() => {
    setMobileSearch("");
    setMobileEquipo(undefined);
    setMobileCliente(undefined);
    setMobileAno(undefined);
    setMobilePage(1);
  }, []);

  // ── Data fetching — desktop ───────────────────────────────────────────────
  const { data, isPending, isFetching } = useRegistrosHoras({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? "desc" : sorting[0] ? "asc" : undefined,
    search: debouncedSearch || undefined,
    equipoJuridicoId: desktopEquipo,
    clienteJuridicoId: desktopCliente,
    ano: desktopAno,
  });

  // ── Data fetching — mobile ────────────────────────────────────────────────
  const { data: mobileData, isPending: isMobilePending } = useRegistrosHoras({
    page: mobilePage,
    pageSize: 20,
    search: debouncedMobileSearch || undefined,
    equipoJuridicoId: mobileEquipo,
    clienteJuridicoId: mobileCliente,
    ano: mobileAno,
  });

  // ── Table config ──────────────────────────────────────────────────────────
  const tableConfig = useMemo(
    () =>
      createTableConfig(RegistroHorasTableConfig, {
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
          PermissionActions["juridico-horas"].registrar,
          PermissionActions["juridico-horas"].gestionar,
        ]}
      >
        {isOpen && (
          <CreateRegistroHoraSheet
            isOpen={true}
            onClose={closeModal}
            currentWeekInfo={currentWeekInfo}
          />
        )}
      </PermissionGuard>

      <RegistroHoraDetailSheet
        registro={selectedRegistro}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </>
  );

  // ── Mobile view ───────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <RegistroHoraMobileView
          data={mobileData}
          isLoading={isMobilePending && !mobileData}
          onCreateClick={openModal}
          onViewDetail={handleViewDetail}
          page={mobilePage}
          onPageChange={handleMobilePageChange}
          search={mobileSearch}
          onSearchChange={handleMobileSearchChange}
          equipoJuridicoId={mobileEquipo}
          onEquipoChange={handleMobileEquipoChange}
          clienteJuridicoId={mobileCliente}
          onClienteChange={handleMobileClienteChange}
          ano={mobileAno}
          onAnoChange={handleMobileAnoChange}
          onClearFilters={handleMobileClearFilters}
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
            title="Registro de Horas"
            subtitle="Administra el registro de horas del área jurídica"
          />

          <PermissionGuard
            permissions={[
              PermissionActions["juridico-horas"].acceder,
              PermissionActions["juridico-horas"].registrar,
              PermissionActions["juridico-horas"].gestionar,
            ]}
          >
            <DataTable
              columns={registroHorasColumns}
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

          {/* Admin-only: solicitudes de autorización */}
          {isAdmin && (
            <PermissionGuard
              permissions={[
                PermissionActions["juridico-horas"]["autorizar-edicion"],
                PermissionActions["juridico-horas"].gestionar,
              ]}
            >
              <AutorizacionesTable />
            </PermissionGuard>
          )}

          {sharedModals}
        </div>
      </CardContent>
    </Card>
  );
}
