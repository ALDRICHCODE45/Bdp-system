import { TableConfig } from "@/core/shared/components/DataTable/types";
import type { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import { ColaboradoresTableFilters } from "./ColaboradoresTableFilters";

/**
 * Default visibility for the slim 7-col colaboradores table (cap1 req1).
 *
 * All 7 columns visible by default. The user can toggle via ColumnVisibilitySelector,
 * and the choice is persisted under `table-preferences-colaboradores-table`.
 */
export const colaboradorDefaultColumnVisibility = {
  colaborador: true,
  cargo: true,
  departamento: true,
  jefe: true,
  fechaIngreso: true,
  modalidad: true,
  estado: true,
};

/**
 * Configuración personalizada para el DataTable de colaboradores (P1, cap1).
 *
 * Mirror de `FacturasTableConfig`:
 * - `customFilter` slot (search + import/export + cards toggle)
 * - `defaultColumnVisibility` (todas las 7 visibles)
 * - `columnOrder.persistKey = 'colaboradores-table'` (persistencia de orden)
 * - `enableColumnVisibility` (selector de columnas)
 */
export const ColaboradoresTableConfig: TableConfig<ColaboradorDto> = {
  filters: {
    customFilter: {
      component: ColaboradoresTableFilters,
      props: {
        // Los handlers reales (onImport / onExport / onViewModeChange) los
        // inyecta `createTableConfig` desde la página.
      },
    },
  },
  actions: {
    showExportButton: false, // el export vive dentro del customFilter para honrar el tab activo
    showAddButton: false,
    showBulkActions: false,
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 30, 50],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No se encontraron colaboradores.",
  enableSorting: true,
  enableColumnVisibility: true,
  enableRowSelection: false, // slim: no bulk actions en esta fase
  columnPinning: {
    enabled: false,
  },
  columnOrder: {
    enabled: true,
    persistKey: "colaboradores-table",
  },
  defaultColumnVisibility: colaboradorDefaultColumnVisibility,
};