"use client";
import { useState } from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/core/shared/ui/button";
import { LucideIcon } from "lucide-react";

import { Badge } from "@/core/shared/ui/badge";
import { Card, CardContent, CardHeader } from "@/core/shared/ui/card";
import { Filter, FileSpreadsheet } from "lucide-react";
import { FilterSelect } from "@/core/shared/components/DataTable/FilterSelect";
import { BaseFilterProps } from "@/core/shared/components/DataTable/types";
import { FilterHeaderActions } from "@/core/shared/components/DataTable/FilterHeaderActions";

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
  addButtonText?: string;
  addButtonIcon?: LucideIcon;
  showAddButton?: boolean;
  onAdd?: () => void;
  onExport?: (table: Table<unknown>) => void;
  onImport?: () => void;
  // Direct filter control (server-side)
  metodoPago?: string;
  onMetodoPagoChange?: (value: string) => void;
  moneda?: string;
  onMonedaChange?: (value: string) => void;
  statusPago?: string;
  onStatusPagoChange?: (value: string) => void;
  onClearFilters?: () => void;
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
  metodoPago,
  onMetodoPagoChange,
  moneda,
  onMonedaChange,
  statusPago,
  onStatusPagoChange,
  onClearFilters,
}: FacturasFiltersProps) {
  // Support both controlled (server-side) and uncontrolled (client-side) modes
  const isControlled = onMetodoPagoChange !== undefined;

  // Uncontrolled: local state managed through table column filters
  const [localMetodoPago, setLocalMetodoPago] = useState("todos");
  const [localMoneda, setLocalMoneda] = useState("todos");
  const [localStatusPago, setLocalStatusPago] = useState("todos");

  const handleMetodoPagoChange = (value: string) => {
    if (isControlled) {
      onMetodoPagoChange?.(value === "todos" ? "" : value);
    } else {
      setLocalMetodoPago(value);
      table.getColumn("metodoPago")?.setFilterValue(value === "todos" ? undefined : value);
    }
  };

  const handleMonedaChange = (value: string) => {
    if (isControlled) {
      onMonedaChange?.(value === "todos" ? "" : value);
    } else {
      setLocalMoneda(value);
      table.getColumn("moneda")?.setFilterValue(value === "todos" ? undefined : value);
    }
  };

  const handleStatusPagoChange = (value: string) => {
    if (isControlled) {
      onStatusPagoChange?.(value === "todos" ? "" : value);
    } else {
      setLocalStatusPago(value);
      table.getColumn("statusPago")?.setFilterValue(value === "todos" ? undefined : value);
    }
  };

  const handleClearFilters = () => {
    if (isControlled) {
      onClearFilters?.();
      onGlobalFilterChange?.("");
    } else {
      setLocalMetodoPago("todos");
      setLocalMoneda("todos");
      setLocalStatusPago("todos");
      table.getColumn("metodoPago")?.setFilterValue(undefined);
      table.getColumn("moneda")?.setFilterValue(undefined);
      table.getColumn("statusPago")?.setFilterValue(undefined);
      onGlobalFilterChange?.("");
    }
  };

  const selectedMetodoPago = isControlled ? (metodoPago || "todos") : localMetodoPago;
  const selectedMoneda = isControlled ? (moneda || "todos") : localMoneda;
  const selectedStatusPago = isControlled ? (statusPago || "todos") : localStatusPago;

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
            onClearFilters={handleClearFilters}
            onExport={onExport}
            table={table}
            exportFileName="facturas"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
