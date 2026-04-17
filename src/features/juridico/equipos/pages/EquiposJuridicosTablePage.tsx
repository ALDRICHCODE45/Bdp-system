"use client";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { equiposJuridicosColumns } from "../components/EquiposJuridicosTableColumns";
import { useGetEquiposJuridicos } from "../hooks/useGetEquiposJuridicos.hook";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { Plus } from "lucide-react";
import type { TableConfig } from "@/core/shared/components/DataTable/types";
import type { EquipoJuridicoDto } from "../server/dtos/EquipoJuridicoDto.dto";

const CreateEquipoJuridicoSheet = dynamic(
  () =>
    import("../components/CreateEquipoJuridicoSheet").then((mod) => ({
      default: mod.CreateEquipoJuridicoSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const tableConfig: TableConfig<EquipoJuridicoDto> = {
  filters: {
    searchColumn: "nombre",
    searchPlaceholder: "Buscar por nombre...",
    showSearch: true,
  },
  actions: {
    showAddButton: true,
    addButtonText: "Nuevo Equipo",
    addButtonIcon: <Plus className="h-4 w-4" />,
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No se encontraron equipos jurídicos.",
  enableSorting: true,
  enableColumnVisibility: true,
  enableRowSelection: false,
};

export function EquiposJuridicosTablePage() {
  const { isOpen, openModal, closeModal } = useModalState();
  const { data, isPending, isFetching } = useGetEquiposJuridicos();

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
        title="Equipos Jurídicos"
        subtitle="Administra los equipos del área jurídica y sus miembros"
      />
      <PermissionGuard
        permissions={[
          PermissionActions["juridico-equipos"].acceder,
          PermissionActions["juridico-equipos"].gestionar,
        ]}
      >
        <DataTable
          columns={equiposJuridicosColumns}
          data={data ?? []}
          config={config}
          isLoading={isPending && !isFetching}
          isFetching={isFetching}
        />
      </PermissionGuard>

      <PermissionGuard
        permissions={[
          PermissionActions["juridico-equipos"].crear,
          PermissionActions["juridico-equipos"].gestionar,
        ]}
      >
        {isOpen && (
          <CreateEquipoJuridicoSheet isOpen={true} onClose={closeModal} />
        )}
      </PermissionGuard>
    </div>
  );
}
