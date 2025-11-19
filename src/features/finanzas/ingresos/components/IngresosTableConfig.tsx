import { Plus, PlusCircle } from "lucide-react";
import { TableConfig } from "@/core/shared/components/DataTable/types";
import { Ingreso } from "../types/Ingreso.type";
import { IngresosFilters } from "./IngresosTableFilters";

// Configuración personalizada para el DataTable
export const IngresosTableConfig: TableConfig<Ingreso> = {
  filters: {
    customFilter: {
      component: IngresosFilters,
      props: {
        showAddButton: true,
        addButtonText: "Nuevo Ingreso",
        addButtonIcon: Plus,
      },
    },
  },
  actions: {
    showExportButton: true,
    onExport: () => {
      console.log("Exportando ingresos");
    },
    showAddButton: true,
    addButtonIcon: <PlusCircle />,
    addButtonText: "Agregar Ingreso",
    onAdd: () => {
      console.log("Agregando Ingreso");
    },
  },
  pagination: {
    defaultPageSize: 5,
    pageSizeOptions: [5, 10, 15, 20],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No se encontraron ingresos.",
  enableSorting: true,
  enableColumnVisibility: true,
  enableRowSelection: true,
};
