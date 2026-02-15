"use client";

import { useMemo, useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { RolesTableColumns } from "../components/RolesTableColumns";
import { RolesTableConfig } from "../components/RolesTableConfig";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import { useRolesPaginated } from "../hooks/useRolesPaginated.hook";

const CreateRoleSheet = dynamic(
  () =>
    import("../components/CreateRoleSheet").then((mod) => ({
      default: mod.CreateRoleSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  },
);

export const RolesTablePage = () => {
  const { isOpen, openModal, closeModal } = useModalState();

  const tableConfig = createTableConfig(RolesTableConfig, {
    onAdd: () => openModal(),
  });

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: tableConfig.pagination?.defaultPageSize ?? 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isPending, isFetching } = useRolesPaginated({
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
      <TablePresentation
        subtitle="Administra y gestiona los roles del sistema"
        title="Gestión de Roles y Permisos"
      />

      <DataTable
        columns={RolesTableColumns}
        data={data?.data ?? []}
        config={serverConfig}
        isLoading={isPending && !isFetching}
      />

      {/* Modal con lazy loading */}
      {isOpen && (
        <CreateRoleSheet isOpen={true} onClose={closeModal} mode="add" />
      )}
    </>
  );
};
