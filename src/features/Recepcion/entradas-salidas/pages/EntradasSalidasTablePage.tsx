"use client";

import { useMemo, useState } from "react";
import { SortingState } from "@tanstack/react-table";
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
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const { isOpen, openModal, closeModal } = useModalState();

  const { data, isPending, isFetching } = useEntradasSalidas({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? "desc" : "asc",
  });

  const handleAdd = () => {
    openModal();
  };

  const tableConfig = createTableConfig(EntradasSalidasTableConfig, {
    onAdd: handleAdd,
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
          isLoading={isPending && !isFetching}
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
