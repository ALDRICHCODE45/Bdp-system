import { Plus } from "lucide-react";
import { TableConfig } from "@/core/shared/components/DataTable/types";
import { FacturaDto } from "../server/dtos/FacturaDto.dto";
import { FacturasFilters } from "./FacturasTableFilters";

/**
 * Columnas visibles por defecto.
 * Las nuevas columnas arrancan ocultas — el usuario las activa desde el selector de columnas.
 * `false` = oculta, `true` (o ausente) = visible.
 */
export const facturaDefaultColumnVisibility = {
  // Visibles por defecto
  concepto: true,
  uuid: true,
  total: true,
  status: true,
  statusPago: true,
  createdAt: true,
  // Ocultas por defecto
  serie: false,
  folio: false,
  rfcEmisor: false,
  nombreEmisor: false,
  rfcReceptor: false,
  nombreReceptor: false,
  subtotal: false,
  totalImpuestosTransladados: false,
  totalImpuestosRetenidos: false,
  moneda: false,
  metodoPago: false,
  medioPago: false,
  usoCfdi: false,
  fechaPago: false,
  ingresadoPorNombre: false,
  updatedAt: false,
};

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
    showExportButton: false,
    showAddButton: true,
    addButtonText: "Nueva Factura",
    showBulkActions: true,
    onBulkDelete: undefined, // set at runtime
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
  columnPinning: {
    enabled: false,
  },
  columnOrder: {
    enabled: true,
    persistKey: "facturas-table",
  },
  defaultColumnVisibility: facturaDefaultColumnVisibility,
};
