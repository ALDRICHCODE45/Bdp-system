import { DataTable } from "@/core/shared/components/DataTable";
import { TablePresentation } from "@/core/shared/components/TablePresentation";
import { ClientesProveedoresColumns } from "../helpers/ClientesProveedoresColumns";
import { clientesProveedoresMockData } from "../types/data/ClientesProveedoresMockData.data";

export const ClientesProovedoresTablePage = () => {
  return (
    <>
      <section className="mx-auto max-w-[75vw] max-h-[100vh] py-10">
        <TablePresentation
          subtitle="¡Gestiona los clientes y los proovedores en este apartado!"
          title="Clientes y Proovedores"
        />

        <DataTable
          columns={ClientesProveedoresColumns}
          data={clientesProveedoresMockData}
        />
      </section>
    </>
  );
};
