import { Plus, PlusCircle } from "lucide-react";
import { TableConfig } from "@/core/shared/components/DataTable/types";
import { FacturaDto } from "../server/dtos/FacturaDto.dto";
import { FacturasFilters } from "./FacturasTableFilters";

// Configuración personalizada para el DataTable
export const FacturasTableConfig: TableConfig<FacturaDto> = {
  filters: {
    customFilter: {
      component: FacturasFilters,
      props: {
        showAddButton: true,
        addButtonText: "Nueva Factura",
        addButtonIcon: Plus,
      },
    },
  },
  actions: {
    showExportButton: true,
    onExport: () => {
      console.log("Exportando facturas");
    },
    showAddButton: true,
    addButtonIcon: <PlusCircle />,
    addButtonText: "Agregar Factura",
    onAdd: () => {
      console.log("Agregando Factura");
    },
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 30, 50],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No se encontraron facturas.",
  enableSorting: true,
  enableColumnVisibility: true,
  enableRowSelection: true,
};
