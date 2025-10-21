"use client";
import { DataTable } from "@/core/shared/components/DataTable";
import { FacturasColumns } from "../components/FacturasColumns";
import { facturasMockData } from "../types/data/FacturasMockData.data";
import { FacturasTableConfig } from "../components/FacturasTableConfig";

export function FacturasTablePage() {
  const data = facturasMockData;
  const columns = FacturasColumns;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Facturas</h1>
        <p className="text-muted-foreground">
          Administra las facturas de tu empresa
        </p>
      </div>
      <DataTable columns={columns} data={data} config={FacturasTableConfig} />
    </div>
  );
}
