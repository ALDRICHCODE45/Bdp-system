"use client";
import { useMemo, useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { columns } from "../helpers/TableColumns";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import { ColaboradoresTableConfig } from "../components/ColaboradoresTableConfig";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { useColaboradores } from "../hooks/useColaboradores.hook";

const CreateColaboradorSheet = dynamic(
  () =>
    import("../components/CreateColaboradorSheet").then((mod) => ({
      default: mod.CreateColaboradorSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  },
);

export const ColaboradoresTablePage = () => {
  const { isOpen, openModal, closeModal } = useModalState();

  const tableConfig = createTableConfig(ColaboradoresTableConfig, {
    onAdd: () => openModal(),
  });

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: tableConfig.pagination?.defaultPageSize ?? 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isPending, isFetching } = useColaboradores({
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
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra la información de tus colaboradores"
        title="Gestión de Colaboradores"
      />
      <PermissionGuard
        permissions={[
          PermissionActions.colaboradores.acceder,
          PermissionActions.colaboradores.gestionar,
        ]}
      >
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          config={serverConfig}
          isLoading={isPending && !isFetching}
        />
      </PermissionGuard>

      {/* Modal con lazy loading */}
      <PermissionGuard
        permissions={[
          PermissionActions.colaboradores.crear,
          PermissionActions.colaboradores.gestionar,
        ]}
      >
        {isOpen && <CreateColaboradorSheet isOpen={true} onClose={closeModal} />}
      </PermissionGuard>
    </div>
  );
};
