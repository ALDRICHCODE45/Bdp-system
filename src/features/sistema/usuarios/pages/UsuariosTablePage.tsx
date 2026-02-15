"use client";
import { useMemo, useState } from "react";
import { SortingState } from "@tanstack/react-table";
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

const CreateUserSheet = dynamic(
  () =>
    import("../components/CreateUserSheet").then((mod) => ({
      default: mod.CreateUserSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

export const UsuariosTablePage = () => {
  const { isOpen, openModal, closeModal } = useModalState();

  const tableConfig = createTableConfig(UsersTableConfig, {
    onAdd: () => openModal(),
  });

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: tableConfig.pagination?.defaultPageSize ?? 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isPending, isFetching } = useUsers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? "desc" : "asc",
  });

  const serverConfig = useMemo(() => ({
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
  }), [tableConfig, data?.pageCount, data?.totalCount]);

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
            config={serverConfig}
            isLoading={isPending && !isFetching}
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
