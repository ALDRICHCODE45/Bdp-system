"use client";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { AsistenciaDto } from "../../asistencias/server/Dtos/AsistenciaDto.dto";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { asistenciaColaboradoresColumns } from "../../asistencias/components/AsistenciaColaboradoresColumns";
import { createTableConfig } from "@/core/shared/helpers/createTableConfig";
import { AsistenciasTableConfig } from "../../asistencias/components/config/AsistenciasTableConfig";
import { useRouter } from "next/navigation";

interface TableData {
  initialData: AsistenciaDto[];
}

export const AsistenciaColaboradoresTablePage = ({
  initialData,
}: TableData) => {
  const router = useRouter();
  const tableConfig = createTableConfig(AsistenciasTableConfig, {
    onAdd: () => router.push("/register-qr-entry"),
  });
  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra las asistencias de tus colaboradores"
        title="Gestión de Asistencias"
      />
      <DataTable
        columns={asistenciaColaboradoresColumns}
        data={initialData}
        config={tableConfig}
      />
    </div>
  );
};
