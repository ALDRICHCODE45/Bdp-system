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
  const { isOpen, modalType, openModal, closeModal } = useModalState();

  const handleAdd = () => {
    openModal("add");
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

        <DataTable
          columns={UserTableColumns}
          data={tableData}
          config={tableConfig}
        />

        {/* Modal con lazy loading */}
        {isOpen && modalType === "add" && (
          <CreateUserSheet isOpen={true} onClose={closeModal} mode="add" />
        )}
      </div>
    </>
  );
};
