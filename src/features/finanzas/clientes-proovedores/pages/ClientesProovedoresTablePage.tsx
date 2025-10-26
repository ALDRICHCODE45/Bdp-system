"use client";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { ClientesProveedoresColumns } from "../components/ClientesProveedoresColumns";
import { clientesProveedoresMockData } from "../types/data/ClientesProveedoresMockData.data";
import { ClientesProovedoresTableConfig } from "../components/ClientesProovedoresTableConfig";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import dynamic from "next/dynamic";

// Lazy loading del modal
const ClienteProveedorModal = dynamic(
  () =>
    import("../components/ClienteProveedorModal").then((mod) => ({
      default: mod.ClienteProveedorModal,
    })),
  {
    ssr: false,
    loading: () => <div>Cargando modal...</div>,
  }
);

export const ClientesProovedoresTablePage = () => {
  const { isOpen, modalType, openModal, closeModal } = useModalState();

  const handleAdd = () => {
    openModal("add");
  };

  // Crear configuración con handlers
  const tableConfig = createTableConfig(ClientesProovedoresTableConfig, {
    onAdd: handleAdd,
  });

  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra los clientes y los proovedores"
        title="Clientes y Proovedores"
      />
      <DataTable
        columns={ClientesProveedoresColumns}
        data={clientesProveedoresMockData}
        config={tableConfig}
      />

      {/* Modal con lazy loading */}
      {isOpen && modalType === "add" && (
        <ClienteProveedorModal isOpen={true} onClose={closeModal} mode="add" />
      )}
    </div>
  );
};
