"use client";

import { TablePresentation } from "@/core/shared/components/TablePresentation";
import { IngresosColumns } from "../helpers/IngresosColumns";
import { ingresosMockData } from "../types/data/IngresosMockData.data";
import { DataTable } from "@/core/shared/components/DataTable";

export const IngresosTablePage = () => {
  return (
    <section className="mx-auto max-w-[75vw] max-h-[100vh] py-10">
      <TablePresentation subtitle="Gestión de ingresos" title="Ingresos" />

      <DataTable columns={IngresosColumns} data={ingresosMockData} />
    </section>
  );
};
