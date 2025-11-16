import { TableConfig } from "@/core/shared/components/DataTable/types";
import { UserPlus } from "lucide-react";
import { RoleDto } from "../types/RoleDto.dto";

export const RolesTableConfig: TableConfig<RoleDto> = {
  filters: {
    searchColumn: "name",
    searchPlaceholder: "Buscar por nombre del rol",
    showSearch: true,
  },
  actions: {
    showExportButton: false,
    showAddButton: true,
    addButtonIcon: <UserPlus />,
    addButtonText: "Agregar Rol",
    onAdd: () => {
      console.log("Agregando Rol");
    },
  },
  emptyStateMessage: "No se encontraron roles",
  pagination: {
    defaultPageSize: 5,
    pageSizeOptions: [5, 10, 15, 20],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  enableColumnVisibility: false,
  enableRowSelection: false,
  enableSorting: true,
};
