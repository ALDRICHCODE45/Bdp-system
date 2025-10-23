import { TableConfig } from "@/core/shared/components/DataTable/types";
import { Factura } from "../types/Factura.type";
import { FilePlus } from "lucide-react";
import { FacturasTableFilters } from "./FacturasTableFilters";

// Configuración simple usanbo filtros por defecto
export const FacturasTableConfig: TableConfig<Factura> = {
  filters: {
    customFilter: {
      component: FacturasTableFilters,
      props: {
        addButtonIcon: FilePlus,
        addButtonText: "Nueva Factura",
        showAddButton: true,
      },
    },
    searchColumn: "clienteProveedor", // Columna por la que buscar
    searchPlaceholder: "Buscar cliente/proovedor...",
    showSearch: true,
  },
  actions: {
    showAddButton: true,
    addButtonText: "Nueva Factura",
    addButtonIcon: <FilePlus className="h4 w-4" />,
    onAdd: () => {
      console.log("Crear nueva factura");
    },
    showExportButton: true,
    onExport: () => {
      console.log("Exportar facturas");
    },
    showRefreshButton: true,
    onRefresh: () => {
      console.log("Actualizar facturas");
    },
  },
  pagination: {
    defaultPageSize: 5,
    pageSizeOptions: [5, 10, 20, 100],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No se encontraron facturas.",
  enableSorting: true,
  enableColumnVisibility: false,
  enableRowSelection: false,
};
