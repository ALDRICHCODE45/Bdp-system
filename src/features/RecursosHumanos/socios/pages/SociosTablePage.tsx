"use client";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { columns } from "../helpers/SociosTableColumns";
import { SocioDto } from "../server/dtos/SocioDto.dto";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { useModalState } from "@/core/shared/hooks/useModalState";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import { SociosTableConfig } from "../components/SociosTableConfig";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";

const CreateSocioSheet = dynamic(
  () =>
    import("../components/CreateSocioSheet").then((mod) => ({
      default: mod.CreateSocioSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

interface SociosTablePageProps {
  tableData: SocioDto[];
}

export const SociosTablePage = ({ tableData }: SociosTablePageProps) => {
  const { isOpen, openModal, closeModal } = useModalState();

  const handleAdd = () => {
    openModal();
  };

  const tableConfig = createTableConfig(SociosTableConfig, {
    onAdd: handleAdd,
  });

  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra la información de los socios responsables"
        title="Gestión de Socios"
      />
      <DataTable columns={columns} data={tableData} config={tableConfig} />
      {isOpen && <CreateSocioSheet isOpen={true} onClose={closeModal} />}
    </div>
  );
};
