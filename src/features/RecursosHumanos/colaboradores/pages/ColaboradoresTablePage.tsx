import { DataTable } from "@/core/shared/components/DataTable";
import { columns } from "../helpers/TableColumns";
import { colaboradoresMockData } from "../types/ColaboradoresTableData";
import { TablePresentation } from "@/core/shared/components/TablePresentation";

export const ColaboradoresTablePage = () => {
  return (
    <>
      <section className="mx-auto max-w-[75vw] max-h-[100vh] py-10">
        <TablePresentation
          subtitle="Gestiona toda la información de tus colaboradores en este apartado!"
          title="Colaboradores"
        />
        <DataTable columns={columns} data={colaboradoresMockData} />
      </section>
    </>
  );
};
