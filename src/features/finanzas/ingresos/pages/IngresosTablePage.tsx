"use client";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { columns } from "../components/IngresosTableColumns";
import { IngresosTableConfig } from "../components/IngresosTableConfig";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { IngresoDto } from "../server/dtos/IngresoDto.dto";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

const CreateIngresoSheet = dynamic(
  () =>
    import("../components/CreateIngresoSheet").then((mod) => ({
      default: mod.CreateIngresoSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

interface IngresosTablePageProps {
  tableData: IngresoDto[];
}

export const IngresosTablePage = ({ tableData }: IngresosTablePageProps) => {
  const { isOpen, openModal, closeModal } = useModalState();

  const handleAdd = () => {
    openModal();
  };

  // Crear configuración con handlers
  const tableConfig = createTableConfig(IngresosTableConfig, {
    onAdd: handleAdd,
  });

  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra y filtra los ingresos de tu empresa"
        title="Gestión de Ingresos"
      />
      <PermissionGuard
        permissions={[
          PermissionActions.ingresos.acceder,
          PermissionActions.ingresos.gestionar,
        ]}
      >
        <DataTable columns={columns} data={tableData} config={tableConfig} />
      </PermissionGuard>

      {/* Modal con lazy loading */}
      <PermissionGuard
        permissions={[
          PermissionActions.ingresos.crear,
          PermissionActions.ingresos.gestionar,
        ]}
      >
        {isOpen && <CreateIngresoSheet isOpen={true} onClose={closeModal} />}
      </PermissionGuard>
    </div>
  );
};
