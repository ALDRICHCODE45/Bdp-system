import { TableConfig } from "@/core/shared/components/DataTable/types";
import { CircleUser, PlusCircle } from "lucide-react";
import { UserDto } from "../server/dtos/UserDto.dto";
import { UsersTableFilters } from "./UsersTableFilters";

export const UsersTableConfig: TableConfig<UserDto> = {
  filters: {
    customFilter: {
      component: UsersTableFilters,
      props: {
        addButtonIcon: CircleUser,
        addButtonText: "Agregar Usuario",
        showAddButton: true,
      },
    },
    searchColumn: "nombre",
    searchPlaceholder: "Buscar por nombre del Usuario",
    showSearch: true,
  },
  actions: {
    showExportButton: true,
    onExport: () => {
      console.log("Exportando usuarios");
    },
    showAddButton: true,
    addButtonIcon: <PlusCircle />,
    addButtonText: "Agregar Usuario",
    onAdd: () => {
      console.log("Agregando Usuario");
    },
  },
  emptyStateMessage: "No se encontraron Usuarios",
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
