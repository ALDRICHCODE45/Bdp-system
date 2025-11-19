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
      <DataTable columns={columns} data={tableData} config={tableConfig} />

      {/* Modal con lazy loading */}
      {isOpen && <CreateIngresoSheet isOpen={true} onClose={closeModal} />}
    </div>
  );
};
