import type { TableConfig } from "@/core/shared/components/DataTable/types";
import type { AsuntoJuridicoDto } from "../server/dtos/AsuntoJuridicoDto.dto";

/**
 * Columnas visibles por defecto.
 * `false` = oculta, `true` (o ausente) = visible.
 */
export const asuntosJuridicosDefaultColumnVisibility = {
  nombre: true,
  estado: true,
  clienteJuridicoNombre: true,
  socioNombre: true,
  descripcion: false,
  createdAt: false,
};

export const AsuntosJuridicosTableConfig: TableConfig<AsuntoJuridicoDto> = {
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 30, 50],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No se encontraron asuntos jurídicos.",
  enableSorting: true,
  enableColumnVisibility: true,
  enableRowSelection: false,
  columnOrder: {
    enabled: true,
    persistKey: "asuntos-juridicos-table",
  },
  defaultColumnVisibility: asuntosJuridicosDefaultColumnVisibility,
};
