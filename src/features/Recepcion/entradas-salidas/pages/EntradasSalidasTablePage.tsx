import { recepcionMockData } from "../types/table/data/RecepcionMockData.data";
import { RecepcionColumns } from "../types/table/columns/RecepcionColumns";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";

export const EntradasYSalidasTablePage = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Entradas y Salidas</h1>
        <p className="text-muted-foreground">
          Administra las entradas y salidas de tu empresa
        </p>
      </div>
      <DataTable columns={RecepcionColumns} data={recepcionMockData} />
    </div>
  );
};
