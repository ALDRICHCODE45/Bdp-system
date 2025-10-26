"use client";
import { EgresosColumns } from "../components/EgresosTableColumns";
import { egresosMockData } from "../types/data/EgresosMockData.data";
import { EgresosTableConfig } from "../components/EgresosTableConfig";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";

export function EgresosTablePage() {
  const data = egresosMockData;
  const columns = EgresosColumns;

  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Administra y filtra los egresos de tu empresa"
        title="Gestión de Egresos"
      />

      <DataTable columns={columns} data={data} config={EgresosTableConfig} />
    </div>
  );
}
