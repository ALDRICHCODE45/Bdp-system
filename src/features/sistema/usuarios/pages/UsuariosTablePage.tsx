"use client";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { UserDto } from "../server/dtos/UserDto.dto";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { UserTableColumns } from "../components/UsersTableColumns";
import { UsersTableConfig } from "../components/UsersTableConfig";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

const CreateUserSheet = dynamic(
  () =>
    import("../components/CreateUserSheet").then((mod) => ({
      default: mod.CreateUserSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

interface UsuariosTablePageProps {
  tableData: UserDto[];
}

export const UsuariosTablePage = ({ tableData }: UsuariosTablePageProps) => {
  const { isOpen, openModal, closeModal } = useModalState();

  const handleAdd = () => {
    openModal();
  };

  const tableConfig = createTableConfig(UsersTableConfig, {
    onAdd: handleAdd,
  });
  return (
    <>
      <div className="container mx-auto py-6">
        <TablePresentation
          subtitle="Administra y filtra los usuarios de la aplicacion"
          title="Gestión de Usuarios"
        />

        <PermissionGuard
          permissions={[
            PermissionActions.usuarios.acceder,
            PermissionActions.usuarios.gestionar,
          ]}
        >
          <DataTable
            columns={UserTableColumns}
            data={tableData}
            config={tableConfig}
          />
        </PermissionGuard>

        {/* Modal con lazy loading */}
        <PermissionGuard
          permissions={[
            PermissionActions.usuarios.crear,
            PermissionActions.usuarios.gestionar,
          ]}
        >
          {isOpen && (
            <CreateUserSheet isOpen={true} onClose={closeModal} mode="add" />
          )}
        </PermissionGuard>
      </div>
    </>
  );
};
