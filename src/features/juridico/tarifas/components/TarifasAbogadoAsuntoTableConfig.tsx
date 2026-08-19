import { Plus } from "lucide-react";
import type { TableConfig } from "@/core/shared/components/DataTable/types";
import type { TarifaAbogadoAsuntoDto } from "../server/dtos/TarifaAbogadoAsuntoDto.dto";

export const tarifasAbogadoAsuntoDefaultColumnVisibility = {
  abogado: true,
  asunto: true,
  tarifaHora: true,
  activa: true,
  updatedAt: false,
};

export const TarifasAbogadoAsuntoTableConfig: TableConfig<TarifaAbogadoAsuntoDto> =
  {
    actions: {
      showAddButton: true,
      addButtonText: "Nueva Tarifa",
      addButtonIcon: <Plus className="size-4" />,
    },
    pagination: {
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 30, 50],
      showPageSizeSelector: true,
      showPaginationInfo: true,
    },
    emptyStateMessage:
      "No hay tarifas activas. Crea la primera para habilitar el registro de horas con importe.",
    enableSorting: true,
    enableColumnVisibility: true,
    enableRowSelection: false,
    columnOrder: {
      enabled: true,
      persistKey: "tarifas-abogado-asunto-table",
    },
    defaultColumnVisibility: tarifasAbogadoAsuntoDefaultColumnVisibility,
  };
