"use client";
import { IngresosColumns } from "../components/IngresosColumns";
import { ingresosMockData } from "../types/data/IngresosMockData.data";
import { IngresosTableConfig } from "../components/IngresosTableConfig";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";

export function IngresosTablePage() {
  const data = ingresosMockData;
  const columns = IngresosColumns;

  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra y filtra los ingresos de tu empresa"
        title="Gestión de Ingresos"
      />

      <DataTable columns={columns} data={data} config={IngresosTableConfig} />
    </div>
  );
}
