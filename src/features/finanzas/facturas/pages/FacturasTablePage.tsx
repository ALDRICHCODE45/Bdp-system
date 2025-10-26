"use client";
import { FacturasColumns } from "../components/FacturasColumns";
import { facturasMockData } from "../types/data/FacturasMockData.data";
import { FacturasTableConfig } from "../components/FacturasTableConfig";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";

export function FacturasTablePage() {
  const data = facturasMockData;
  const columns = FacturasColumns;

  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra las facturas de tu empresa"
        title="Gestión de Facturas"
      />

      <DataTable columns={columns} data={data} config={FacturasTableConfig} />
    </div>
  );
}
