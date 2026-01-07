"use client";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { columns } from "../helpers/TableColumns";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import { ColaboradoresTableConfig } from "../components/ColaboradoresTableConfig";
import { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

const CreateColaboradorSheet = dynamic(
  () =>
    import("../components/CreateColaboradorSheet").then((mod) => ({
      default: mod.CreateColaboradorSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  },
);

interface TableData {
  tableData: ColaboradorDto[];
}

export const ColaboradoresTablePage = ({ tableData }: TableData) => {
  const { isOpen, openModal, closeModal } = useModalState();

  const handleAdd = () => {
    openModal();
  };

  const tableConfig = createTableConfig(ColaboradoresTableConfig, {
    onAdd: handleAdd,
  });

  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra la información de tus colaboradores"
        title="Gestión de Colaboradores"
      />
      <PermissionGuard
        permissions={[
          PermissionActions.colaboradores.acceder,
          PermissionActions.colaboradores.gestionar,
        ]}
      >
        <DataTable columns={columns} data={tableData} config={tableConfig} />
      </PermissionGuard>

      {/* Modal con lazy loading */}
      <PermissionGuard
        permissions={[
          PermissionActions.colaboradores.crear,
          PermissionActions.colaboradores.gestionar,
        ]}
      >
        {isOpen && <CreateColaboradorSheet isOpen={true} onClose={closeModal} />}
      </PermissionGuard>
    </div>
  );
};
