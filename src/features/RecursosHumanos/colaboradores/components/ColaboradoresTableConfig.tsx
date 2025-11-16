import { TableConfig } from "@/core/shared/components/DataTable/types";
import { PlusCircle, UserPlus } from "lucide-react";
import { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import { ColaboradoresTableFilters } from "./ColaboradoresTableFilters";

export const ColaboradoresTableConfig: TableConfig<ColaboradorDto> = {
  filters: {
    customFilter: {
      component: ColaboradoresTableFilters,
      props: {
        addButtonIcon: UserPlus,
        addButtonText: "Agregar Colaborador",
        showAddButton: true,
      },
    },
    searchColumn: "name",
    searchPlaceholder: "Buscar por nombre del Colaborador",
    showSearch: true,
  },
  actions: {
    showExportButton: true,
    onExport: () => {
      console.log("Exportando Colaborador");
    },
    showAddButton: true,
    addButtonIcon: <PlusCircle />,
    addButtonText: "Agregar Colaborador",
    onAdd: () => {
      console.log("Agregando Colaborador");
    },
  },
  emptyStateMessage: "No se encontraron Colaboradores",
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
