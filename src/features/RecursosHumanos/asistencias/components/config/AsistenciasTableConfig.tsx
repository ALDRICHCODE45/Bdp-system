import { TableConfig } from "@/core/shared/components/DataTable/types";
import { PlusCircle, UserPlus } from "lucide-react";
import { AsistenciaWithColaborador } from "../../server/mappers/AsistenciaMapper";
import { AsistenciasTableFilters } from "./AsitenciasTableFilters.config";

export const AsistenciasTableConfig: TableConfig<AsistenciaWithColaborador> = {
  filters: {
    customFilter: {
      component: AsistenciasTableFilters,
      props: {
        addButtonIcon: UserPlus,
        addButtonText: "Agregar Asistencia",
        showAddButton: true,
      },
    },
    searchColumn: "correo",
    searchPlaceholder: "Buscar por correo del Colaborador",
    showSearch: true,
  },
  actions: {
    showExportButton: true,
    onExport: () => {
      console.log("Exportando Asistencia");
    },
    showAddButton: true,
    addButtonIcon: <PlusCircle />,
    addButtonText: "Agregar Asitencia",
    onAdd: () => {
      console.log("Agregando Asistencia");
    },
  },
  emptyStateMessage: "No se encontraron asistencias",
  pagination: {
    defaultPageSize: 5,
    pageSizeOptions: [5, 10, 15, 20],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  enableColumnVisibility: true,
  enableRowSelection: true,
  enableSorting: true,
};
