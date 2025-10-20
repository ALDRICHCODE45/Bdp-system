"use client";
import { DataTable } from "@/core/shared/components/DataTable";
import { IngresosFilters } from "../components/IngresosFilters";
import { IngresosColumns } from "../helpers/IngresosColumns";
import { TableConfig } from "@/core/shared/components/DataTable/types";
import { Plus } from "lucide-react";
import { ingresosMockData } from "../types/data/IngresosMockData.data";
import { Ingreso } from "../types/Ingreso.type";

export function IngresosTablePageExample() {
  const data = ingresosMockData;
  const columns = IngresosColumns;

  // Configuración personalizada para el DataTable
  const tableConfig: TableConfig<Ingreso> = {
    filters: {
      customFilter: {
        component: IngresosFilters,
        props: {
          // Aquí puedes pasar props adicionales específicas para el componente de filtros
        },
      },
    },
    actions: {
      showAddButton: true,
      addButtonText: "Nuevo Ingreso",
      addButtonIcon: <Plus className="h-4 w-4" />,
      onAdd: () => {
        console.log("Agregar nuevo ingreso");
        // Aquí iría la lógica para abrir un modal o navegar a una página de creación
      },
      showExportButton: true,
      onExport: () => {
        console.log("Exportar ingresos");
        // Aquí iría la lógica para exportar los datos
      },
      showRefreshButton: true,
      onRefresh: () => {
        console.log("Actualizar datos");
        // Aquí iría la lógica para refrescar los datos
      },
    },
    pagination: {
      defaultPageSize: 10,
      pageSizeOptions: [5, 10, 20, 50],
      showPageSizeSelector: true,
      showPaginationInfo: true,
    },
    emptyStateMessage: "No se encontraron ingresos.",
    enableSorting: true,
    enableColumnVisibility: false,
    enableRowSelection: false,
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Ingresos</h1>
        <p className="text-muted-foreground">
          Administra y filtra los ingresos de tu empresa
        </p>
      </div>

      <DataTable columns={columns} data={data} config={tableConfig} />
    </div>
  );
}
