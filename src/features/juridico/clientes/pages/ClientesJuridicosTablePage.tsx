"use client";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { clientesJuridicosColumns } from "../components/ClientesJuridicosTableColumns";
import { useGetClientesJuridicos } from "../hooks/useGetClientesJuridicos.hook";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { Plus } from "lucide-react";
import type { TableConfig } from "@/core/shared/components/DataTable/types";
import type { ClienteJuridicoDto } from "../server/dtos/ClienteJuridicoDto.dto";

const CreateClienteJuridicoSheet = dynamic(
  () =>
    import("../components/CreateClienteJuridicoSheet").then((mod) => ({
      default: mod.CreateClienteJuridicoSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const tableConfig: TableConfig<ClienteJuridicoDto> = {
  filters: {
    searchColumn: "nombre",
    searchPlaceholder: "Buscar por nombre...",
    showSearch: true,
  },
  actions: {
    showAddButton: true,
    addButtonText: "Nuevo Cliente",
    addButtonIcon: <Plus className="h-4 w-4" />,
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No se encontraron clientes jurídicos.",
  enableSorting: true,
  enableColumnVisibility: true,
  enableRowSelection: false,
};

export function ClientesJuridicosTablePage() {
  const { isOpen, openModal, closeModal } = useModalState();
  const { data, isPending, isFetching } = useGetClientesJuridicos();

  const config = {
    ...tableConfig,
    actions: {
      ...tableConfig.actions,
      onAdd: openModal,
    },
  };

  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        title="Clientes Jurídicos"
        subtitle="Administra los clientes del área jurídica"
      />
      <PermissionGuard
        permissions={[
          PermissionActions["juridico-clientes"].acceder,
          PermissionActions["juridico-clientes"].gestionar,
        ]}
      >
        <DataTable
          columns={clientesJuridicosColumns}
          data={data ?? []}
          config={config}
          isLoading={isPending && !isFetching}
          isFetching={isFetching}
        />
      </PermissionGuard>

      <PermissionGuard
        permissions={[
          PermissionActions["juridico-clientes"].crear,
          PermissionActions["juridico-clientes"].gestionar,
        ]}
      >
        {isOpen && (
          <CreateClienteJuridicoSheet isOpen={true} onClose={closeModal} />
        )}
      </PermissionGuard>
    </div>
  );
}
