"use client";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { asuntosJuridicosColumns } from "../components/AsuntosJuridicosTableColumns";
import { useGetAsuntosJuridicos } from "../hooks/useGetAsuntosJuridicos.hook";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { Plus } from "lucide-react";
import type { TableConfig } from "@/core/shared/components/DataTable/types";
import type { AsuntoJuridicoDto } from "../server/dtos/AsuntoJuridicoDto.dto";

const CreateAsuntoJuridicoSheet = dynamic(
  () =>
    import("../components/CreateAsuntoJuridicoSheet").then((mod) => ({
      default: mod.CreateAsuntoJuridicoSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const tableConfig: TableConfig<AsuntoJuridicoDto> = {
  filters: {
    searchColumn: "nombre",
    searchPlaceholder: "Buscar por nombre...",
    showSearch: true,
  },
  actions: {
    showAddButton: true,
    addButtonText: "Nuevo Asunto",
    addButtonIcon: <Plus className="h-4 w-4" />,
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No se encontraron asuntos jurídicos.",
  enableSorting: true,
  enableColumnVisibility: true,
  enableRowSelection: false,
};

export function AsuntosJuridicosTablePage() {
  const { isOpen, openModal, closeModal } = useModalState();
  const { data, isPending, isFetching } = useGetAsuntosJuridicos();

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
        title="Asuntos Jurídicos"
        subtitle="Administra los asuntos del área jurídica"
      />
      <PermissionGuard
        permissions={[
          PermissionActions["juridico-asuntos"].acceder,
          PermissionActions["juridico-asuntos"].gestionar,
        ]}
      >
        <DataTable
          columns={asuntosJuridicosColumns}
          data={data ?? []}
          config={config}
          isLoading={isPending && !isFetching}
          isFetching={isFetching}
        />
      </PermissionGuard>

      <PermissionGuard
        permissions={[
          PermissionActions["juridico-asuntos"].crear,
          PermissionActions["juridico-asuntos"].gestionar,
        ]}
      >
        {isOpen && (
          <CreateAsuntoJuridicoSheet isOpen={true} onClose={closeModal} />
        )}
      </PermissionGuard>
    </div>
  );
}
