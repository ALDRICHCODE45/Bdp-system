"use client";
import { useMemo, useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { columns } from "../components/ClientesProveedoresTableColumns";
import { ClientesProovedoresTableConfig } from "../components/ClientesProovedoresTableConfig";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { useClientesProveedoresPaginated } from "../hooks/useClientesProveedoresPaginated.hook";

const CreateClienteProveedorSheet = dynamic(
  () =>
    import("../components/CreateClienteProveedorSheet").then((mod) => ({
      default: mod.CreateClienteProveedorSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

export const ClientesProovedoresTablePage = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const { isOpen, openModal, closeModal } = useModalState();

  const { data, isPending, isFetching } = useClientesProveedoresPaginated({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? "desc" : "asc",
  });

  const handleAdd = () => {
    openModal();
  };

  // Crear configuración con handlers
  const tableConfig = createTableConfig(ClientesProovedoresTableConfig, {
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
        subtitle="Administra los clientes y los proveedores"
        title="Clientes y Proveedores"
      />

      <PermissionGuard
        permissions={[
          PermissionActions["clientes-proovedores"].acceder,
          PermissionActions["clientes-proovedores"].gestionar,
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
          PermissionActions["clientes-proovedores"].crear,
          PermissionActions["clientes-proovedores"].gestionar,
        ]}
      >
        {isOpen && (
          <CreateClienteProveedorSheet isOpen={true} onClose={closeModal} />
        )}
      </PermissionGuard>
    </div>
  );
};
