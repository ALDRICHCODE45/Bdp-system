"use client";
import { DataTable } from "@/core/shared/components/DataTable";
import { IngresosColumns } from "../components/IngresosColumns";
import { ingresosMockData } from "../types/data/IngresosMockData.data";
import { IngresosTableConfig } from "../components/IngresosTableConfig";

export function IngresosTablePage() {
  const data = ingresosMockData;
  const columns = IngresosColumns;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Ingresos</h1>
        <p className="text-muted-foreground">
          Administra y filtra los ingresos de tu empresa
        </p>
      </div>

      <DataTable columns={columns} data={data} config={IngresosTableConfig} />
    </div>
  );
}
