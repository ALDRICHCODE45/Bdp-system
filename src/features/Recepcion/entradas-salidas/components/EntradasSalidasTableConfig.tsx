import { TableConfig } from "@/core/shared/components/DataTable/types";
import { PlusCircle } from "lucide-react";
import { EntradasSalidasDTO } from "../server/dtos/EntradasSalidasDto.dto";
import { EntradasSalidasTableFilters } from "./EntradasSalidasTableFilters";

export const EntradasSalidasTableConfig: TableConfig<EntradasSalidasDTO> = {
  filters: {
    customFilter: {
      component: EntradasSalidasTableFilters,
      props: {
        addButtonIcon: PlusCircle,
        addButtonText: "Agregar Entrada/Salida",
        showAddButton: true,
      },
    },
    searchColumn: "visitante",
    searchPlaceholder: "Buscar por nombre del visitante",
    showSearch: true,
  },
  actions: {
    showExportButton: true,
    onExport: () => {},
    showAddButton: true,
    addButtonIcon: <PlusCircle />,
    addButtonText: "Agregar Entrada/Salida",
    onAdd: () => {},
  },
  emptyStateMessage: "No se encontraron Entradas/Salidas",
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
