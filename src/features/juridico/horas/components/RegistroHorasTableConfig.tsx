import { Plus } from "lucide-react";
import type { TableConfig } from "@/core/shared/components/DataTable/types";
import type { RegistroHoraDto } from "../server/dtos/RegistroHoraDto.dto";

/**
 * Columnas visibles por defecto.
 * `false` = oculta, `true` (o ausente) = visible.
 */
export const registroHorasDefaultColumnVisibility = {
  semana: true,
  equipoJuridicoNombre: true,
  clienteJuridicoNombre: true,
  asuntoJuridicoNombre: true,
  horas: true,
  editable: true,
  // hidden by default:
  socioNombre: false,
  usuarioNombre: false,
  descripcion: false,
  createdAt: false,
};

export const RegistroHorasTableConfig: TableConfig<RegistroHoraDto> = {
  filters: {
    searchPlaceholder: "Buscar por abogado, cliente, asunto...",
    showSearch: true,
  },
  actions: {
    showAddButton: true,
    addButtonText: "Registrar Horas",
    addButtonIcon: <Plus className="size-4" />,
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 30, 50],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No se encontraron registros de horas.",
  enableSorting: true,
  enableColumnVisibility: true,
  enableRowSelection: false,
  columnOrder: {
    enabled: true,
    persistKey: "registro-horas-table",
  },
  defaultColumnVisibility: registroHorasDefaultColumnVisibility,
};
