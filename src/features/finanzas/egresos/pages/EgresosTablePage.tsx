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
      <DataTable columns={columns} data={tableData} config={tableConfig} />

      {/* Modal con lazy loading */}
      {isOpen && <CreateEgresoSheet isOpen={true} onClose={closeModal} />}
    </div>
  );
};
