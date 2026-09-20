import type { TableConfig } from "@/core/shared/components/DataTable/types";
import type { MovimientoListItemDto } from "../server/dtos/MovimientoListDto.dto";
import { MOVIMIENTOS_DEFAULT_VISIBILITY } from "./MovimientosColumns";
import { MovimientoFilters } from "./MovimientoFilters";

/**
 * Columnas visibles por defecto (curated set).
 *
 * La tabla arranca con las columnas de lectura rápida visibles; el resto queda
 * disponible desde el selector de columnas (`ColumnVisibilitySelector`) y se
 * persisten bajo `table-preferences-movimientos-table`.
 *
 * El mapa vive junto a las definiciones de columnas en `MovimientosColumns`
 * (fuente única de verdad) y se re-exporta acá para que el módulo de config
 * sea el punto de entrada, igual que `facturaDefaultColumnVisibility`.
 */
export const movimientosDefaultColumnVisibility =
  MOVIMIENTOS_DEFAULT_VISIBILITY;

/**
 * Configuración personalizada para el DataTable de movimientos (Facturas-style).
 *
 * Contiene la parte estática que antes vivía inline en `MovimientosTable`:
 * - `customFilter` slot (filtros, importación y selector de columnas)
 * - `defaultColumnVisibility` (set curado de columnas)
 * - `columnOrder.persistKey = "movimientos-table"` → persistencia de orden y
 *   visibilidad de columnas en localStorage
 * - `pagination` server-side
 *
 * Los handlers dependientes del runtime (`onAdd`, `onImport`, `onExport`,
 * `onBulkDelete`) los inyecta `MovimientosTable` con `createTableConfig`.
 */
export const MovimientosTableConfig: TableConfig<MovimientoListItemDto> = {
  filters: {
    // La búsqueda global la maneja la página, no el buscador del DataTable.
    showSearch: false,
    customFilter: {
      // El shared DataTable tipa las props del customFilter con un index
      // signature que `MovimientoFiltersProps` no tiene a propósito; el cast
      // se hace una sola vez acá en el borde, igual que antes en la tabla.
      component: MovimientoFilters as React.ComponentType<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any
      >,
      props: {},
    },
  },
  actions: {
    // El export vive dentro del customFilter para respetar los filtros activos.
    showExportButton: false,
    onExport: undefined, // set at runtime
    showBulkActions: true,
    onBulkDelete: undefined, // set at runtime
  },
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No se encontraron movimientos.",
  enableSorting: true,
  enableColumnVisibility: true,
  enableRowSelection: true,
  columnPinning: {
    enabled: false,
  },
  columnOrder: {
    enabled: true,
    persistKey: "movimientos-table",
  },
  defaultColumnVisibility: movimientosDefaultColumnVisibility,
};
