"use client";
import { Table } from "@tanstack/react-table";
import { Button } from "@/core/shared/ui/button";

import { Badge } from "@/core/shared/ui/badge";
import { Card, CardContent, CardHeader } from "@/core/shared/ui/card";
import { Filter, FileSpreadsheet } from "lucide-react";
import { useFacturasTableFilters } from "../hooks/useFacturasTableFilters";
import { FilterSelect } from "@/core/shared/components/DataTable/FilterSelect";
import { BaseFilterProps } from "@/core/shared/components/DataTable/types";
import { FilterHeaderActions } from "@/core/shared/components/DataTable/FilterHeaderActions";

const statusOptions = [
  { label: "Todos", value: "todos" },
  { label: "BORRADOR", value: "borrador" },
  { label: "ENVIADA", value: "enviada" },
  { label: "PAGADA", value: "pagada" },
  { label: "CANCELADA", value: "cancelada" },
];

const metodoPagoOptions = [
  { label: "Todos", value: "todos" },
  { label: "CHEQUE", value: "CHEQUE" },
  { label: "TRANSFERENCIA", value: "TRANSFERENCIA" },
  { label: "EFECTIVO", value: "EFECTIVO" },
];

const monedaOptions = [
  { label: "Todos", value: "todos" },
  { label: "MXN", value: "MXN" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
];

const statusPagoOptions = [
  { label: "Todos", value: "todos" },
  { label: "Vigente", value: "Vigente" },
  { label: "Cancelado", value: "Cancelado" },
  { label: "No Pagado", value: "NoPagado" },
];

interface FacturasFiltersProps extends BaseFilterProps {
  table: Table<unknown>;
  onGlobalFilterChange?: (value: string) => void;
  onAdd?: () => void;
  onExport?: (table: Table<unknown>) => void;
  onImport?: () => void;
}

export function FacturasFilters({
  table,
  onGlobalFilterChange,
  addButtonIcon,
  addButtonText = "Agregar",
  showAddButton,
  onAdd,
  onExport,
  onImport,
}: FacturasFiltersProps) {
  const {
    clearFilters,
    handleStatusChange,
    handleMetodoPagoChange,
    handleMonedaChange,
    handleStatusPagoChange,
    selectedStatus,
    selectedMetodoPago,
    selectedMoneda,
    selectedStatusPago,
  } = useFacturasTableFilters(table);

  return (
    <Card className="mb-6 w-full min-w-0">
      <CardHeader className="pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Filter className="h-5 w-5 text-primary flex-shrink-0" />
          <Badge variant="outline" className="ml-2 flex-shrink-0">
            {table.getRowCount()} resultados
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto min-w-0">
          {onImport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onImport}
              className="h-8 px-3 flex items-center gap-1"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Importar Excel</span>
            </Button>
          )}
          <FilterHeaderActions
            showAddButton={showAddButton}
            AddButtonIcon={addButtonIcon}
            addButtonText={addButtonText}
            buttonTooltipText="Agregar Factura"
            onAdd={onAdd}
            onClearFilters={() => {
              clearFilters();
              onGlobalFilterChange?.("");
            }}
            onExport={onExport}
            table={table}
            exportFileName="facturas"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FilterSelect
            label="Status"
            options={statusOptions}
            value={selectedStatus}
            onValueChange={handleStatusChange}
          />

          <FilterSelect
            label="Método de Pago"
            options={metodoPagoOptions}
            value={selectedMetodoPago}
            onValueChange={handleMetodoPagoChange}
          />

          <FilterSelect
            label="Moneda"
            options={monedaOptions}
            value={selectedMoneda}
            onValueChange={handleMonedaChange}
          />

          <FilterSelect
            label="Status de Pago"
            options={statusPagoOptions}
            value={selectedStatusPago}
            onValueChange={handleStatusPagoChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
