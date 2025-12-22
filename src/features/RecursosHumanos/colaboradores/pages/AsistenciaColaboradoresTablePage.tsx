import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { AsistenciaDto } from "../../asistencias/server/Dtos/AsistenciaDto.dto";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { asistenciaColaboradoresColumns } from "../../asistencias/components/AsistenciaColaboradoresColumns";

interface TableData {
  initialData: AsistenciaDto[];
}

export const AsistenciaColaboradoresTablePage = ({
  initialData,
}: TableData) => {
  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra las asistencias de tus colaboradores"
        title="Gestión de Asistencias"
      />
      <DataTable
        columns={asistenciaColaboradoresColumns}
        data={initialData}
        //config={tableConfig}
      />
    </div>
  );
};
