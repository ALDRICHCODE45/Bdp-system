"use client";

import { TablePresentation } from "@/core/shared/components/TablePresentation";
import { EgresosColumns } from "../helpers/EgresosColumns";
import { egresosMockData } from "../types/data/EgresosMockData.data";
import { DataTable } from "@/core/shared/components/DataTable";

export const EgresosTablePage = () => {
  return (
    <section className="mx-auto max-w-[75vw] max-h-[100vh] py-10">
      <TablePresentation subtitle="Gestión de egresos" title="Egresos" />

      <DataTable columns={EgresosColumns} data={egresosMockData} />
    </section>
  );
};
