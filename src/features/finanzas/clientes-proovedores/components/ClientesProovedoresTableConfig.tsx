import { TableConfig } from "@/core/shared/components/DataTable/types";
import { ClienteProveedor } from "../types/ClienteProveedor.type";
import { CircleUser, PlusCircle } from "lucide-react";
import { ClientesProovedoresTableFilters } from "./ClientesProovedoresTableFilters";
import { Table } from "@tanstack/react-table";
import { exportToExcel } from "@/core/shared/helpers/exportToExcel";

export const ClientesProovedoresTableConfig: TableConfig<ClienteProveedor> = {
  filters: {
    customFilter: {
      component: ClientesProovedoresTableFilters,
      props: {
        addButtonIcon: CircleUser,
        addButtonText: "Agregar Cliente/Proovedor",
        showAddButton: true,
      },
    },
    // searchColumn: "nombre",
    // searchPlaceholder: "Buscar por nombre del Proovedor",
    // showSearch: true,
  },
  actions: {
    showExportButton: true,
    onExport: (table: Table<unknown>) => {
      exportToExcel(table as Table<ClienteProveedor>, "clientes-proveedores");
    },
    showAddButton: true,
    addButtonIcon: <PlusCircle />,
    addButtonText: "Agregar Cliente/Proovedor",
    onAdd: () => {
      console.log("Agregando Cliente/Proovedor");
    },
  },
  emptyStateMessage: "No se encontraron Clientes o proovedores",
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
