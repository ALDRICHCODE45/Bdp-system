"use client";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { UserDto } from "../server/dtos/UserDto.dto";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { UserTableColumns } from "../components/UsersTableColumns";
import { UsersTableConfig } from "../components/UsersTableConfig";

interface UsuariosTablePageProps {
  tableData: UserDto[];
}

export const UsuariosTablePage = ({ tableData }: UsuariosTablePageProps) => {
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
          config={UsersTableConfig}
        />
      </div>
    </>
  );
};
