"use client";
import { DataTable } from "@/core/shared/components/DataTable";
import { FacturasColumns } from "../helpers/FacturasColumns";
import { facturasMockData } from "../types/data/FacturasMockData.data";
import { TableConfig } from "@/core/shared/components/DataTable/types";
import { Plus } from "lucide-react";
import { Factura } from "../types/Factura.type";

export function FacturasTablePageExample() {
  const data = facturasMockData;
  const columns = FacturasColumns;

  // Configuración simple usando filtros por defecto
  const tableConfig: TableConfig<Factura> = {
    filters: {
      searchColumn: "numero", // Columna por la que buscar
      searchPlaceholder: "Buscar por número de factura...",
      showSearch: true,
    },
    actions: {
      showAddButton: true,
      addButtonText: "Nueva Factura",
      addButtonIcon: <Plus className="h-4 w-4" />,
      onAdd: () => {
        console.log("Crear nueva factura");
      },
      showExportButton: true,
      onExport: () => {
        console.log("Exportar facturas");
      },
      showRefreshButton: true,
      onRefresh: () => {
        console.log("Actualizar facturas");
      },
    },
    pagination: {
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 50, 100],
      showPageSizeSelector: true,
      showPaginationInfo: true,
    },
    emptyStateMessage: "No se encontraron facturas.",
    enableSorting: true,
    enableColumnVisibility: false,
    enableRowSelection: false,
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Facturas</h1>
        <p className="text-muted-foreground">
          Administra las facturas de tu empresa
        </p>
      </div>

      <DataTable columns={columns} data={data} config={tableConfig} />
    </div>
  );
}
