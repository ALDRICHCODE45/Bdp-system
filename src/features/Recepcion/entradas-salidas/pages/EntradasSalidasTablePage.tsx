import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { recepcionMockData } from "../types/table/data/RecepcionMockData.data";
import { RecepcionColumns } from "../types/table/columns/RecepcionColumns";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";

export const EntradasYSalidasTablePage = () => {
  return (
    <>
      <section className="mx-auto max-w-[75vw] max-h-[100vh] py-10">
        <TablePresentation
          subtitle="¡Gestiona toda la información de las entradas y salidas!"
          title="Recepción"
        />
        <DataTable columns={RecepcionColumns} data={recepcionMockData} />
      </section>
    </>
  );
};
