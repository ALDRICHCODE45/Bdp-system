"use client";
import { DataTable } from "@/core/shared/components/DataTable";
import { EgresosColumns } from "../components/EgresosTableColumns";
import { egresosMockData } from "../types/data/EgresosMockData.data";
import { EgresosTableConfig } from "../components/EgresosTableConfig";

export function EgresosTablePage() {
  const data = egresosMockData;
  const columns = EgresosColumns;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Egresos</h1>
        <p className="text-muted-foreground">
          Administra y filtra los egresos de tu empresa
        </p>
      </div>

      <DataTable columns={columns} data={data} config={EgresosTableConfig} />
    </div>
  );
}
