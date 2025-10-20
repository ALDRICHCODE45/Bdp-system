"use client";
import { DataTable } from "@/core/shared/components/DataTable";
import { EgresosFilters } from "../components/EgresosFilters";
import { EgresosColumns } from "../helpers/EgresosColumns";
import { TableConfig } from "@/core/shared/components/DataTable/types";
import { Plus } from "lucide-react";
import { egresosMockData } from "../types/data/EgresosMockData.data";
import { Egreso } from "../types/Egreso.type";

export function EgresosTablePageExample() {
  const data = egresosMockData;
  const columns = EgresosColumns;

  // Configuración personalizada para el DataTable
  const tableConfig: TableConfig<Egreso> = {
    filters: {
      customFilter: {
        component: EgresosFilters,
        props: {
          // Aquí puedes pasar props adicionales específicas para el componente de filtros
        },
      },
    },
    actions: {
      showAddButton: true,
      addButtonText: "Nuevo Egreso",
      addButtonIcon: <Plus className="h-4 w-4" />,
      onAdd: () => {
        console.log("Agregar nuevo egreso");
        // Aquí iría la lógica para abrir un modal o navegar a una página de creación
      },
      showExportButton: true,
      onExport: () => {
        console.log("Exportar egresos");
        // Aquí iría la lógica para exportar los datos
      },
      showRefreshButton: true,
      onRefresh: () => {
        console.log("Actualizar datos");
        // Aquí iría la lógica para refrescar los datos
      },
    },
    pagination: {
      defaultPageSize: 15,
      pageSizeOptions: [5, 10, 15, 25, 50],
      showPageSizeSelector: true,
      showPaginationInfo: true,
    },
    emptyStateMessage: "No se encontraron egresos.",
    enableSorting: true,
    enableColumnVisibility: true,
    enableRowSelection: true,
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Egresos</h1>
        <p className="text-muted-foreground">
          Administra y filtra los egresos de tu empresa
        </p>
      </div>

      <DataTable columns={columns} data={data} config={tableConfig} />
    </div>
  );
}
