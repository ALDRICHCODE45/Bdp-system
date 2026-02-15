"use client";
import { useMemo, useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { columns } from "../helpers/SociosTableColumns";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import { SociosTableConfig } from "../components/SociosTableConfig";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { useSociosPaginated } from "../hooks/useSociosPaginated.hook";

const CreateSocioSheet = dynamic(
  () =>
    import("../components/CreateSocioSheet").then((mod) => ({
      default: mod.CreateSocioSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

export const SociosTablePage = () => {
  const { isOpen, openModal, closeModal } = useModalState();

  const tableConfig = createTableConfig(SociosTableConfig, {
    onAdd: () => openModal(),
  });

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: tableConfig.pagination?.defaultPageSize ?? 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isPending, isFetching } = useSociosPaginated({
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
        subtitle="Administra la información de los socios responsables"
        title="Gestión de Socios"
      />
      <PermissionGuard
        permissions={[
          PermissionActions.socios.acceder,
          PermissionActions.socios.gestionar,
        ]}
      >
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          config={serverConfig}
          isLoading={isPending && !isFetching}
        />
      </PermissionGuard>
      <PermissionGuard
        permissions={[
          PermissionActions.socios.crear,
          PermissionActions.socios.gestionar,
        ]}
      >
        {isOpen && <CreateSocioSheet isOpen={true} onClose={closeModal} />}
      </PermissionGuard>
    </div>
  );
};
