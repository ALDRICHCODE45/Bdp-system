import { recepcionMockData } from "../types/table/data/RecepcionMockData.data";
import { RecepcionColumns } from "../types/table/columns/RecepcionColumns";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";

export const EntradasYSalidasTablePage = () => {
  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra las entradas y salidas de tu empresa"
        title="Gestión de Entradas y Salidas"
      />
      <DataTable columns={RecepcionColumns} data={recepcionMockData} />
    </div>
  );
};
