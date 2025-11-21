import { Plus, PlusCircle } from "lucide-react";
import { TableConfig } from "@/core/shared/components/DataTable/types";
import { Egreso } from "../types/Egreso.type";
import { EgresosFilters } from "./EgresosTableFilters";
import { Table } from "@tanstack/react-table";
import { exportToExcel } from "@/core/shared/helpers/exportToExcel";

// Configuración personalizada para el DataTable
export const EgresosTableConfig: TableConfig<Egreso> = {
  filters: {
    customFilter: {
      component: EgresosFilters,
      props: {
        showAddButton: true,
        addButtonText: "Nuevo Egreso",
        addButtonIcon: Plus,
      },
    },
  },
  actions: {
    showExportButton: true,
    onExport: (table: Table<unknown>) => {
      exportToExcel(table as Table<Egreso>, "egresos");
    },
    showAddButton: true,
    addButtonIcon: <PlusCircle />,
    addButtonText: "Agregar Cliente/Proovedor",
    onAdd: () => {
      console.log("Agregando Cliente/Proovedor");
    },
  },
  pagination: {
    defaultPageSize: 5,
    pageSizeOptions: [5, 10, 15, 20],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No se encontraron egresos.",
  enableSorting: true,
  enableColumnVisibility: true,
  enableRowSelection: true,
};
