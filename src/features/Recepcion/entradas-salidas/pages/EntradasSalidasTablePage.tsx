"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import { EntradasSalidasTableConfig } from "../components/EntradasSalidasTableConfig";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { EntradasSalidasTableColumns } from "../components/table/EntradaSalidaTableColumns";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { useEntradasSalidas } from "../hooks/useEntradasSalidas.hook";
import { useDebounce } from "@/core/shared/hooks/use-debounce";

const CreateEntradaSalidaSheet = dynamic(
  () =>
    import("../components/CreateEntradaSalidaSheet").then((mod) => ({
      default: mod.CreateEntradaSalidaSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  },
);

export const EntradasYSalidasTablePage = () => {
  const { isOpen, openModal, closeModal } = useModalState();

  const handleOpenModal = useCallback(() => openModal(), [openModal]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: EntradasSalidasTableConfig.pagination?.defaultPageSize ?? 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const handlePaginationChange = useCallback((nextPagination: PaginationState) => {
    setPagination(nextPagination);
  }, []);

  const handleSortingChange = useCallback((nextSorting: SortingState) => {
    setSorting(nextSorting);
  }, []);

  const handleGlobalFilterChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { data, isPending } = useEntradasSalidas({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? "desc" : sorting[0] ? "asc" : undefined,
    search: debouncedSearch || undefined,
  });

  const serverConfig = useMemo(
    () =>
      createTableConfig(EntradasSalidasTableConfig, {
        onAdd: handleOpenModal,
        serverSide: {
          enabled: true,
          totalCount: data?.totalCount ?? 0,
          pageCount: data?.pageCount ?? 0,
        },
      }),
    [handleOpenModal, data?.pageCount, data?.totalCount],
  );

  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra las entradas y salidas de tu empresa"
        title="Gestión de Entradas y Salidas"
      />
      <PermissionGuard
        permissions={[
          PermissionActions.recepcion.acceder,
          PermissionActions.recepcion.gestionar,
        ]}
      >
        <DataTable
          columns={EntradasSalidasTableColumns}
          data={data?.data ?? []}
          config={serverConfig}
          isLoading={isPending}
          pagination={pagination}
          sorting={sorting}
          onPaginationChange={handlePaginationChange}
          onSortingChange={handleSortingChange}
          onGlobalFilterChange={handleGlobalFilterChange}
        />
      </PermissionGuard>

      {/* Modal con lazy loading */}
      <PermissionGuard
        permissions={[
          PermissionActions.recepcion.crear,
          PermissionActions.recepcion.gestionar,
        ]}
      >
        {isOpen && (
          <CreateEntradaSalidaSheet isOpen={true} onClose={closeModal} />
        )}
      </PermissionGuard>
    </div>
  );
};
