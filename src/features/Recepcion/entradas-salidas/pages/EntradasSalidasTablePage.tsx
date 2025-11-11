"use client";

import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { EntradasSalidasDTO } from "../server/dtos/EntradasSalidasDto.dto";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import { EntradasSalidasTableConfig } from "../components/EntradasSalidasTableConfig";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { EntradasSalidasTableColumns } from "../components/table/EntradaSalidaTableColumns";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";

const CreateEntradaSalidaSheet = dynamic(
  () =>
    import("../components/CreateEntradaSalidaSheet").then((mod) => ({
      default: mod.CreateEntradaSalidaSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

interface EntradasSalidasProps {
  tableData: EntradasSalidasDTO[];
}

export const EntradasYSalidasTablePage = ({
  tableData,
}: EntradasSalidasProps) => {
  const { isOpen, openModal, closeModal } = useModalState();

  const handleAdd = () => {
    openModal();
  };

  const tableConfig = createTableConfig(EntradasSalidasTableConfig, {
    onAdd: handleAdd,
  });

  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra las entradas y salidas de tu empresa"
        title="Gestión de Entradas y Salidas"
      />
      <DataTable
        columns={EntradasSalidasTableColumns}
        data={tableData}
        config={tableConfig}
      />

      {/* Modal con lazy loading */}
      {isOpen && (
        <CreateEntradaSalidaSheet isOpen={true} onClose={closeModal} />
      )}
    </div>
  );
};
