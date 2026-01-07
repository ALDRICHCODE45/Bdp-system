"use client";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { columns } from "../components/EgresosTableColumns";
import { EgresosTableConfig } from "../components/EgresosTableConfig";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { EgresoDto } from "../server/dtos/EgresoDto.dto";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

const CreateEgresoSheet = dynamic(
  () =>
    import("../components/CreateEgresoSheet").then((mod) => ({
      default: mod.CreateEgresoSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

interface EgresosTablePageProps {
  tableData: EgresoDto[];
}

export const EgresosTablePage = ({ tableData }: EgresosTablePageProps) => {
  const { isOpen, openModal, closeModal } = useModalState();

  const handleAdd = () => {
    openModal();
  };

  // Crear configuración con handlers
  const tableConfig = createTableConfig(EgresosTableConfig, {
    onAdd: handleAdd,
  });

  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra y filtra los egresos de tu empresa"
        title="Gestión de Egresos"
      />
      <PermissionGuard
        permissions={[
          PermissionActions.egresos.acceder,
          PermissionActions.egresos.gestionar,
        ]}
      >
        <DataTable columns={columns} data={tableData} config={tableConfig} />
      </PermissionGuard>

      {/* Modal con lazy loading */}
      <PermissionGuard
        permissions={[
          PermissionActions.egresos.crear,
          PermissionActions.egresos.gestionar,
        ]}
      >
        {isOpen && <CreateEgresoSheet isOpen={true} onClose={closeModal} />}
      </PermissionGuard>
    </div>
  );
};
