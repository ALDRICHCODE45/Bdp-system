import { Plus } from "lucide-react";
import type { TableConfig } from "@/core/shared/components/DataTable/types";
import type { ClienteJuridicoDto } from "../server/dtos/ClienteJuridicoDto.dto";

/**
 * Columnas visibles por defecto.
 * `false` = oculta, `true` (o ausente) = visible.
 */
export const clientesJuridicosDefaultColumnVisibility = {
  nombre: true,
  rfc: true,
  email: true,
  telefono: true,
  contacto: false,
  direccion: false,
  notas: false,
  createdAt: false,
};

export const ClientesJuridicosTableConfig: TableConfig<ClienteJuridicoDto> = {
  actions: {
    showAddButton: true,
    addButtonText: "Nuevo Cliente",
    addButtonIcon: <Plus className="size-4" />,
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 30, 50],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No se encontraron clientes jurídicos.",
  enableSorting: true,
  enableColumnVisibility: true,
  enableRowSelection: false,
  columnOrder: {
    enabled: true,
    persistKey: "clientes-juridicos-table",
  },
  defaultColumnVisibility: clientesJuridicosDefaultColumnVisibility,
};
