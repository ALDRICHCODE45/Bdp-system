"use client";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { ClientesProveedoresColumns } from "../components/ClientesProveedoresColumns";
import { clientesProveedoresMockData } from "../types/data/ClientesProveedoresMockData.data";
import { ClientesProovedoresTableConfig } from "../components/ClientesProovedoresTableConfig";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";

export const ClientesProovedoresTablePage = () => {
  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra los clientes y los proovedores"
        title="Clientes y Proovedores"
      />
      <DataTable
        columns={ClientesProveedoresColumns}
        data={clientesProveedoresMockData}
        config={ClientesProovedoresTableConfig}
      />
    </div>
  );
};
