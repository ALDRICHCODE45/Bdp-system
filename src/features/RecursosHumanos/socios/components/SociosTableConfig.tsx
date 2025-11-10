import { TableConfig } from "@/core/shared/components/DataTable/types";
import { CircleUser, PlusCircle } from "lucide-react";
import { SociosTableFilters } from "./SociosTableFilters";
import { SocioDto } from "../server/dtos/SocioDto.dto";

export const SociosTableConfig: TableConfig<SocioDto> = {
  filters: {
    customFilter: {
      component: SociosTableFilters,
      props: {
        addButtonIcon: CircleUser,
        addButtonText: "Agregar Socio",
        showAddButton: true,
      },
    },
    searchColumn: "name",
    searchPlaceholder: "Buscar por nombre del Socio",
    showSearch: true,
  },
  actions: {
    showExportButton: true,
    onExport: () => {
      console.log("Exportando Socio");
    },
    showAddButton: true,
    addButtonIcon: <PlusCircle />,
    addButtonText: "Agregar Socio",
    onAdd: () => {
      console.log("Agregando Socio");
    },
  },
  emptyStateMessage: "No se encontraron Socio",
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
