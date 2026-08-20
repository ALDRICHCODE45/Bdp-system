"use client";
import { useCallback, useMemo, useState } from "react";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { UserTableColumns } from "../components/UsersTableColumns";
import { UsersTableConfig } from "../components/UsersTableConfig";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { useUsers } from "../hooks/useUsers.hook";
import { useDebounce } from "@/core/shared/hooks/use-debounce";

const CreateUserSheet = dynamic(
  () =>
    import("../components/CreateUserSheet").then((mod) => ({
      default: mod.CreateUserSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  },
);

export const UsuariosTablePage = () => {
  const { isOpen, openModal, closeModal } = useModalState();

  // ── Paginación / ordenamiento / búsqueda / estado (server-side) ──────────
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: UsersTableConfig.pagination?.defaultPageSize ?? 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [estadoFilter, setEstadoFilter] = useState<string>("todos");

  const resetPage = useCallback(
    () => setPagination((prev) => ({ ...prev, pageIndex: 0 })),
    [],
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
      setSearch(value);
      resetPage();
    },
    [resetPage],
  );

  const handleEstadoChange = useCallback(
    (value: string) => {
      setEstadoFilter(value);
      resetPage();
    },
    [resetPage],
  );

  const isActive =
    estadoFilter === "activo"
      ? true
      : estadoFilter === "inactivo"
        ? false
        : undefined;

  const { data, isPending, isFetching } = useUsers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? "desc" : sorting[0] ? "asc" : undefined,
    search: debouncedSearch || undefined,
    isActive,
  });

  const tableConfig = useMemo(
    () =>
      createTableConfig(UsersTableConfig, {
        onAdd: () => openModal(),
        serverSide: {
          enabled: true,
          totalCount: data?.totalCount ?? 0,
          pageCount: data?.pageCount ?? 0,
        },
        customFilterProps: {
          estado: estadoFilter,
          onEstadoChange: handleEstadoChange,
        },
      }),
    [
      data?.totalCount,
      data?.pageCount,
      openModal,
      estadoFilter,
      handleEstadoChange,
    ],
  );

  return (
    <>
      <div className="container mx-auto py-6">
        <TablePresentation
          subtitle="Administra y filtra los usuarios de la aplicacion"
          title="Gestión de Usuarios"
        />

        <PermissionGuard
          permissions={[
            PermissionActions.usuarios.acceder,
            PermissionActions.usuarios.gestionar,
          ]}
        >
          <DataTable
            columns={UserTableColumns}
            data={data?.data ?? []}
            config={tableConfig}
            isLoading={isPending && !isFetching}
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
            PermissionActions.usuarios.crear,
            PermissionActions.usuarios.gestionar,
          ]}
        >
          {isOpen && (
            <CreateUserSheet isOpen={true} onClose={closeModal} mode="add" />
          )}
        </PermissionGuard>
      </div>
    </>
  );
};
