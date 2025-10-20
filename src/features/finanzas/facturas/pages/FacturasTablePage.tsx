"use client";

import { TablePresentation } from "@/core/shared/components/TablePresentation";
import { FacturasColumns } from "../helpers/FacturasColumns";
import { facturasMockData } from "../types/data/FacturasMockData.data";
import { DataTable } from "@/core/shared/components/DataTable";

export const FacturasTablePage = () => {
  return (
    <section className="mx-auto max-w-[75vw] max-h-[100vh] py-10">
      <TablePresentation
        subtitle="Gestión de facturas del sistema"
        title="Facturas"
      />

      <DataTable columns={FacturasColumns} data={facturasMockData} />
    </section>
  );
};
