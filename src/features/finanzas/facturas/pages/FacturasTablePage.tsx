"use client";

import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { columns } from "../components/FacturasTableColumns";
import { FacturasTableConfig } from "../components/FacturasTableConfig";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { FacturaDto } from "../server/dtos/FacturaDto.dto";

const CreateFacturaSheet = dynamic(
  () =>
    import("../components/CreateFacturaSheet").then((mod) => ({
      default: mod.CreateFacturaSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

interface FacturasTablePageProps {
  tableData: FacturaDto[];
}

export function FacturasTablePage({ tableData }: FacturasTablePageProps) {
  const { isOpen, openModal, closeModal } = useModalState();

  const handleAdd = () => {
    openModal();
  };

  // Crear configuración con handlers
  const tableConfig = createTableConfig(FacturasTableConfig, {
    onAdd: handleAdd,
  });

  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra y gestiona las facturas de tu empresa"
        title="Gestión de Facturas"
      />
      <DataTable columns={columns} data={tableData} config={tableConfig} />

      {/* Modal con lazy loading */}
      {isOpen && <CreateFacturaSheet isOpen={true} onClose={closeModal} />}
    </div>
  );
}
