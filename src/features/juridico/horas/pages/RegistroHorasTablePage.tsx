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
import { usePermissions } from "@/core/shared/hooks/use-permissions";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { Card, CardContent } from "@/core/shared/ui/card";
import dynamic from "next/dynamic";

import { useRegistrosHoras } from "../hooks/useRegistrosHoras.hook";
import { createRegistroHorasColumns } from "../components/RegistroHorasTableColumns";
import { RegistroHorasTableConfig } from "../components/RegistroHorasTableConfig";
import { RegistroHoraDetailSheet } from "../components/RegistroHoraDetailSheet";
import { RegistroHoraMobileView } from "../components/mobile/RegistroHoraMobileView";
import { AutorizacionesTable } from "../components/AutorizacionesTable";
import { getCurrentWeekInfo } from "@/core/shared/helpers/weekUtils";
import type { RegistroHoraDto } from "../server/dtos/RegistroHoraDto.dto";
import {
  EMPTY_REGISTRO_HORAS_ADVANCED_FILTERS,
  type RegistroHorasAdvancedFilters,
} from "../types/RegistroHorasAdvancedFilters.type";

const CreateRegistroHoraSheet = dynamic(
  () =>
    import("../components/CreateRegistroHoraSheet").then((mod) => ({
      default: mod.CreateRegistroHoraSheet,
    })),
  { ssr: false, loading: () => <LoadingModalState /> }
);

export function RegistroHorasTablePage() {
  const isMobile = useIsMobile();
  const { hasAnyPermission: checkAny } = usePermissions();
  const canManageAutorizaciones = checkAny([
    PermissionActions["juridico-horas"]["autorizar-edicion"],
    PermissionActions["juridico-horas"].gestionar,
  ]);
  const canFilterByUsuario = checkAny([
    PermissionActions["juridico-horas"].gestionar,
    PermissionActions["juridico-horas"]["ver-reportes"],
  ]);
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

  const [desktopEquipoIds, setDesktopEquipoIds] = useState<string[]>([]);
  const [desktopClienteIds, setDesktopClienteIds] = useState<string[]>([]);
  const [desktopUsuarioIds, setDesktopUsuarioIds] = useState<string[]>([]);
  const [desktopAdvancedFilters, setDesktopAdvancedFilters] =
    useState<RegistroHorasAdvancedFilters>(
      EMPTY_REGISTRO_HORAS_ADVANCED_FILTERS
    );

  // ── Mobile: separate state ────────────────────────────────────────────────
  const [mobilePage, setMobilePage] = useState(1);
  const [mobileSearch, setMobileSearch] = useState("");
  const debouncedMobileSearch = useDebounce(mobileSearch, 300);
  const [mobileEquipoIds, setMobileEquipoIds] = useState<string[]>([]);
  const [mobileClienteIds, setMobileClienteIds] = useState<string[]>([]);
  const [mobileUsuarioIds, setMobileUsuarioIds] = useState<string[]>([]);
  const [mobileAdvancedFilters, setMobileAdvancedFilters] =
    useState<RegistroHorasAdvancedFilters>(
      EMPTY_REGISTRO_HORAS_ADVANCED_FILTERS
    );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const resetPage = useCallback(
    () => setPagination((prev) => ({ ...prev, pageIndex: 0 })),
    []
  );

  const handleViewDetail = useCallback((registro: RegistroHoraDto) => {
    setSelectedRegistro(registro);
    setIsDetailOpen(true);
  }, []);

  const columns = useMemo(
    () => createRegistroHorasColumns(handleViewDetail, { canManage: canManageAutorizaciones }),
    [handleViewDetail, canManageAutorizaciones]
  );

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

  const handleMobileEquipoChange = useCallback((ids: string[]) => {
      setMobileEquipoIds(ids);
      setMobilePage(1);
    }, []);

  const handleMobileClienteChange = useCallback((ids: string[]) => {
      setMobileClienteIds(ids);
      setMobilePage(1);
    }, []);

  const handleMobileUsuarioChange = useCallback((ids: string[]) => {
    setMobileUsuarioIds(ids);
    setMobilePage(1);
  }, []);

  const handleMobileClearFilters = useCallback(() => {
    setMobileSearch("");
    setMobileEquipoIds([]);
    setMobileClienteIds([]);
    setMobileUsuarioIds([]);
    setMobileAdvancedFilters(EMPTY_REGISTRO_HORAS_ADVANCED_FILTERS);
    setMobilePage(1);
  }, []);

  const handleDesktopClearFilters = useCallback(() => {
    setDesktopEquipoIds([]);
    setDesktopClienteIds([]);
    setDesktopUsuarioIds([]);
    setDesktopAdvancedFilters(EMPTY_REGISTRO_HORAS_ADVANCED_FILTERS);
    setSearch("");
    resetPage();
  }, [resetPage]);

  // ── Data fetching — desktop ───────────────────────────────────────────────
  const { data, isPending, isFetching } = useRegistrosHoras({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? "desc" : sorting[0] ? "asc" : undefined,
    search: debouncedSearch || undefined,
    equipoJuridicoIds: desktopEquipoIds,
    clienteJuridicoIds: desktopClienteIds,
    usuarioIds: canFilterByUsuario ? desktopUsuarioIds : undefined,
    asuntoJuridicoIds: desktopAdvancedFilters.asuntoJuridicoIds,
    socioIds: desktopAdvancedFilters.socioIds,
    ano: desktopAdvancedFilters.ano,
    semanaDesde: desktopAdvancedFilters.semanaDesde,
    semanaHasta: desktopAdvancedFilters.semanaHasta,
    horasMin: desktopAdvancedFilters.horasMin
      ? Number(desktopAdvancedFilters.horasMin)
      : undefined,
    horasMax: desktopAdvancedFilters.horasMax
      ? Number(desktopAdvancedFilters.horasMax)
      : undefined,
    fechaRegistroDesde: desktopAdvancedFilters.fechaRegistroDesde || undefined,
    fechaRegistroHasta: desktopAdvancedFilters.fechaRegistroHasta || undefined,
  });

  // ── Data fetching — mobile ────────────────────────────────────────────────
  const { data: mobileData, isPending: isMobilePending } = useRegistrosHoras({
    page: mobilePage,
    pageSize: 20,
    search: debouncedMobileSearch || undefined,
    equipoJuridicoIds: mobileEquipoIds,
    clienteJuridicoIds: mobileClienteIds,
    usuarioIds: canFilterByUsuario ? mobileUsuarioIds : undefined,
    asuntoJuridicoIds: mobileAdvancedFilters.asuntoJuridicoIds,
    socioIds: mobileAdvancedFilters.socioIds,
    ano: mobileAdvancedFilters.ano,
    semanaDesde: mobileAdvancedFilters.semanaDesde,
    semanaHasta: mobileAdvancedFilters.semanaHasta,
    horasMin: mobileAdvancedFilters.horasMin
      ? Number(mobileAdvancedFilters.horasMin)
      : undefined,
    horasMax: mobileAdvancedFilters.horasMax
      ? Number(mobileAdvancedFilters.horasMax)
      : undefined,
    fechaRegistroDesde: mobileAdvancedFilters.fechaRegistroDesde || undefined,
    fechaRegistroHasta: mobileAdvancedFilters.fechaRegistroHasta || undefined,
  });

  // ── Table config ──────────────────────────────────────────────────────────
  const tableConfig = useMemo(
    () =>
        createTableConfig(RegistroHorasTableConfig, {
          onAdd: openModal,
          customFilterProps: {
            equipoJuridicoIds: desktopEquipoIds,
            clienteJuridicoIds: desktopClienteIds,
            usuarioIds: desktopUsuarioIds,
            canFilterByUsuario,
            onEquipoJuridicoIdsChange: (value: string[]) => {
              setDesktopEquipoIds(value);
              resetPage();
            },
            onClienteJuridicoIdsChange: (value: string[]) => {
              setDesktopClienteIds(value);
              resetPage();
            },
            onUsuarioIdsChange: (value: string[]) => {
              setDesktopUsuarioIds(value);
              resetPage();
            },
            advancedFilters: desktopAdvancedFilters,
            onApplyAdvancedFilters: (filters: RegistroHorasAdvancedFilters) => {
              setDesktopAdvancedFilters(filters);
              resetPage();
            },
            onClearFilters: handleDesktopClearFilters,
          },
          serverSide: {
            enabled: true,
            totalCount: data?.totalCount ?? 0,
          pageCount: data?.pageCount ?? 0,
        },
      }),
    [
      openModal,
      data?.totalCount,
      data?.pageCount,
      desktopEquipoIds,
      desktopClienteIds,
      desktopUsuarioIds,
      canFilterByUsuario,
      desktopAdvancedFilters,
      handleDesktopClearFilters,
      resetPage,
    ]
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
          equipoJuridicoIds={mobileEquipoIds}
          onEquipoChange={handleMobileEquipoChange}
          clienteJuridicoIds={mobileClienteIds}
          onClienteChange={handleMobileClienteChange}
          usuarioIds={mobileUsuarioIds}
          onUsuarioChange={handleMobileUsuarioChange}
          canFilterByUsuario={canFilterByUsuario}
          advancedFilters={mobileAdvancedFilters}
          onAdvancedFiltersChange={(filters) => {
            setMobileAdvancedFilters(filters);
            setMobilePage(1);
          }}
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

          {/* Admin/gestor: solicitudes de autorización pendientes */}
          {canManageAutorizaciones && <AutorizacionesTable />}

          {sharedModals}
        </div>
      </CardContent>
    </Card>
  );
}
