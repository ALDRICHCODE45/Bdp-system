import { Plus } from "lucide-react";
import { TableConfig } from "@/core/shared/components/DataTable/types";
import { Egreso } from "../types/Egreso.type";
import { EgresosFilters } from "./EgresosTableFilters";

// Configuración personalizada para el DataTable
export const EgresosTableConfig: TableConfig<Egreso> = {
  filters: {
    customFilter: {
      component: EgresosFilters,
      props: {
        showAddButton: true,
        addButtonText: "Nuevo Egreso",
        addButtonIcon: Plus,
        // Aquí puedes pasar props adicionales específicas para el componente de filtros
      },
    },
  },
  actions: {},
  pagination: {
    defaultPageSize: 5,
    pageSizeOptions: [5, 10, 15, 25, 50],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No se encontraron egresos.",
  enableSorting: true,
  enableColumnVisibility: true,
  enableRowSelection: true,
};
