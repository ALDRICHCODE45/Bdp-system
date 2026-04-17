import { Plus } from "lucide-react";
import type { TableConfig } from "@/core/shared/components/DataTable/types";
import type { EquipoJuridicoDto } from "../server/dtos/EquipoJuridicoDto.dto";

/**
 * Columnas visibles por defecto.
 * `false` = oculta, `true` (o ausente) = visible.
 */
export const equiposJuridicosDefaultColumnVisibility = {
  nombre: true,
  descripcion: true,
  miembrosCount: true,
  createdAt: false,
};

export const EquiposJuridicosTableConfig: TableConfig<EquipoJuridicoDto> = {
  actions: {
    showAddButton: true,
    addButtonText: "Nuevo Equipo",
    addButtonIcon: <Plus className="size-4" />,
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 30, 50],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No se encontraron equipos jurídicos.",
  enableSorting: true,
  enableColumnVisibility: true,
  enableRowSelection: false,
  columnOrder: {
    enabled: true,
    persistKey: "equipos-juridicos-table",
  },
  defaultColumnVisibility: equiposJuridicosDefaultColumnVisibility,
};
