"use client";

import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { RoleDto } from "../types/RoleDto.dto";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { RolesTableColumns } from "../components/RolesTableColumns";
import { RolesTableConfig } from "../components/RolesTableConfig";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";

const CreateRoleSheet = dynamic(
  () =>
    import("../components/CreateRoleSheet").then((mod) => ({
      default: mod.CreateRoleSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  },
);

interface RolesTablePageProps {
  tableData: RoleDto[];
}

export const RolesTablePage = ({ tableData }: RolesTablePageProps) => {
  const { isOpen, openModal, closeModal } = useModalState();

  const handleAdd = () => {
    openModal();
  };

  const tableConfig = createTableConfig(RolesTableConfig, {
    onAdd: handleAdd,
  });

  return (
    <>
      <TablePresentation
        subtitle="Administra y gestiona los roles del sistema"
        title="Gestión de Roles y Permisos"
      />

      <DataTable
        columns={RolesTableColumns}
        data={tableData}
        config={tableConfig}
      />

      {/* Modal con lazy loading */}
      {isOpen && (
        <CreateRoleSheet isOpen={true} onClose={closeModal} mode="add" />
      )}
    </>
  );
};
