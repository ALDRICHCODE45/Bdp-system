"use client";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { columns } from "../components/ClientesProveedoresTableColumns";
import { ClientesProovedoresTableConfig } from "../components/ClientesProovedoresTableConfig";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { ClienteProveedorDto } from "../server/dtos/ClienteProveedorDto.dto";

const CreateClienteProveedorSheet = dynamic(
  () =>
    import("../components/CreateClienteProveedorSheet").then((mod) => ({
      default: mod.CreateClienteProveedorSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

interface ClientesProovedoresTablePageProps {
  tableData: ClienteProveedorDto[];
}

export const ClientesProovedoresTablePage = ({
  tableData,
}: ClientesProovedoresTablePageProps) => {
  const { isOpen, openModal, closeModal } = useModalState();

  const handleAdd = () => {
    openModal();
  };

  // Crear configuración con handlers
  const tableConfig = createTableConfig(ClientesProovedoresTableConfig, {
    onAdd: handleAdd,
  });

  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra los clientes y los proveedores"
        title="Clientes y Proveedores"
      />
      <DataTable columns={columns} data={tableData} config={tableConfig} />

      {/* Modal con lazy loading */}
      {isOpen && (
        <CreateClienteProveedorSheet isOpen={true} onClose={closeModal} />
      )}
    </div>
  );
};
