"use client";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { registroHorasColumns } from "../components/RegistroHorasTableColumns";
import { useGetRegistrosHoras } from "../hooks/useGetRegistrosHoras.hook";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { Plus } from "lucide-react";
import type { TableConfig } from "@/core/shared/components/DataTable/types";
import type { RegistroHoraDto } from "../server/dtos/RegistroHoraDto.dto";
import { getCurrentWeekInfo } from "@/core/shared/helpers/weekUtils";
import { AutorizacionesTable } from "../components/AutorizacionesTable";

const CreateRegistroHoraSheet = dynamic(
  () =>
    import("../components/CreateRegistroHoraSheet").then((mod) => ({
      default: mod.CreateRegistroHoraSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

const tableConfig: TableConfig<RegistroHoraDto> = {
  filters: {
    searchColumn: "clienteJuridicoNombre",
    searchPlaceholder: "Buscar por cliente...",
    showSearch: true,
  },
  actions: {
    showAddButton: true,
    addButtonText: "Registrar Horas",
    addButtonIcon: <Plus className="h-4 w-4" />,
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No se encontraron registros de horas.",
  enableSorting: true,
  enableColumnVisibility: true,
  enableRowSelection: false,
};

export function RegistroHorasTablePage() {
  const { isOpen, openModal, closeModal } = useModalState();
  const { data, isPending, isFetching } = useGetRegistrosHoras();
  const currentWeekInfo = getCurrentWeekInfo();

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
        title="Registro de Horas"
        subtitle="Administra el registro de horas del área jurídica"
      />

      <PermissionGuard
        permissions={[PermissionActions["juridico-horas"].acceder]}
      >
        <DataTable
          columns={registroHorasColumns}
          data={data ?? []}
          config={config}
          isLoading={isPending && !isFetching}
          isFetching={isFetching}
        />
      </PermissionGuard>

      <PermissionGuard
        permissions={[
          PermissionActions["juridico-horas"].registrar,
          PermissionActions["juridico-horas"].gestionar,
        ]}
      >
        {isOpen && (
          <CreateRegistroHoraSheet
            isOpen={true}
            onClose={closeModal}
            currentWeekInfo={currentWeekInfo}
          />
        )}
      </PermissionGuard>

      {/* Admin-only section: Pending edit authorization requests */}
      <PermissionGuard
        permissions={[
          PermissionActions["juridico-horas"]["autorizar-edicion"],
          PermissionActions["juridico-horas"].gestionar,
        ]}
      >
        <AutorizacionesTable />
      </PermissionGuard>
    </div>
  );
}
