import { TableConfig } from "@/core/shared/components/DataTable/types";
import { Ingreso } from "../types/Ingreso.type";
import { IngresosFilters } from "./IngresosFilters";
import { BanknoteArrowUp, Plus } from "lucide-react";

// Configuración personalizada para el DataTable
export const IngresosTableConfig: TableConfig<Ingreso> = {
  filters: {
    customFilter: {
      component: IngresosFilters,
      props: {
        // Aquí puedes pasar props adicionales específicas para el componente de filtros
        addButtonIcon: BanknoteArrowUp,
        addButtonText: "",
        showAddButton: true,
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
    defaultPageSize: 5,
    pageSizeOptions: [5, 10, 20, 50],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No se encontraron ingresos.",
  enableSorting: true,
  enableColumnVisibility: false,
  enableRowSelection: false,
};
