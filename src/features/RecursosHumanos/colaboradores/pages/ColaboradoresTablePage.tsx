import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { columns } from "../helpers/TableColumns";
import { colaboradoresMockData } from "../types/ColaboradoresTableData";

export const ColaboradoresTablePage = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Colaboradores</h1>
        <p className="text-muted-foreground">
          Administra la información de tus colaboradores
        </p>
      </div>
      <DataTable columns={columns} data={colaboradoresMockData} />
    </div>
  );
};
