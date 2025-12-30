"use client";
import { Table } from "@tanstack/react-table";
import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import { Badge } from "@/core/shared/ui/badge";
import { Card, CardContent, CardHeader } from "@/core/shared/ui/card";
import { Filter, FileSpreadsheet } from "lucide-react";
import { useFacturasTableFilters } from "../hooks/useFacturasTableFilters";
import { FilterSelect } from "@/core/shared/components/DataTable/FilterSelect";
import { BaseFilterProps } from "@/core/shared/components/DataTable/types";
import { FilterHeaderActions } from "@/core/shared/components/DataTable/FilterHeaderActions";

const estadosFacturaOptions = [
  { label: "Todos", value: "todos" },
  { label: "Borrador", value: "borrador" },
  { label: "Enviada", value: "enviada" },
  { label: "Pagada", value: "pagada" },
  { label: "Cancelada", value: "cancelada" },
];

const tipoOrigenOptions = [
  { label: "Todos", value: "todos" },
  { label: "Ingreso", value: "ingreso" },
  { label: "Egreso", value: "egreso" },
];

const formaPagoOptions = [
  { label: "Todos", value: "todos" },
  { label: "Transferencia", value: "transferencia" },
  { label: "Efectivo", value: "efectivo" },
  { label: "Cheque", value: "cheque" },
];

// Genera opciones de periodo para los ultimos 24 meses
const generatePeriodoOptions = () => {
  const options = [{ label: "Todos", value: "todos" }];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const value = `${year}-${month}`;
    const label = date.toLocaleDateString("es-MX", { year: "numeric", month: "long" });
    options.push({ label: label.charAt(0).toUpperCase() + label.slice(1), value });
  }
  return options;
};

const periodoOptions = generatePeriodoOptions();

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
    handleEstadoChange,
    handleTipoOrigenChange,
    handleFormaPagoChange,
    handleMontoFilter,
    handlePeriodoChange,
    handleClienteProveedorChange,
    handleRfcEmisorChange,
    handleCreadoPorChange,
    selectedEstado,
    selectedTipoOrigen,
    selectedFormaPago,
    selectedMontoRange,
    selectedPeriodo,
    clienteProveedorFilter,
    rfcEmisorFilter,
    creadoPorFilter,
    setMontoRange,
  } = useFacturasTableFilters(table);

  return (
    <Card className="mb-6 border-0 shadow-md w-full min-w-0 overflow-hidden">
      <CardHeader className="pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Filter className="h-5 w-5 text-primary flex-shrink-0" />
          <Badge variant="outline" className="ml-2 flex-shrink-0">
            {table.getFilteredRowModel().rows.length} resultados
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
            label="Estado"
            options={estadosFacturaOptions}
            value={selectedEstado}
            onValueChange={handleEstadoChange}
          />

          <FilterSelect
            label="Tipo de Origen"
            options={tipoOrigenOptions}
            value={selectedTipoOrigen}
            onValueChange={handleTipoOrigenChange}
          />

          <FilterSelect
            label="Forma de Pago"
            options={formaPagoOptions}
            value={selectedFormaPago}
            onValueChange={handleFormaPagoChange}
          />

          <FilterSelect
            label="Período"
            options={periodoOptions}
            value={selectedPeriodo}
            onValueChange={handlePeriodoChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clienteProveedor">Cliente/Proveedor</Label>
            <Input
              id="clienteProveedor"
              type="text"
              placeholder="Buscar cliente/proveedor..."
              value={clienteProveedorFilter}
              onChange={(e) => handleClienteProveedorChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfcEmisor">RFC Emisor</Label>
            <Input
              id="rfcEmisor"
              type="text"
              placeholder="Buscar RFC..."
              value={rfcEmisorFilter}
              onChange={(e) => handleRfcEmisorChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="creadoPor">Creado Por</Label>
            <Input
              id="creadoPor"
              type="text"
              placeholder="Buscar creador..."
              value={creadoPorFilter}
              onChange={(e) => handleCreadoPorChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="montoMin">Rango de Monto</Label>
            <div className="flex gap-2">
              <Input
                id="montoMin"
                type="number"
                placeholder="Mínimo"
                value={selectedMontoRange.min}
                onChange={(e) =>
                  setMontoRange({
                    ...selectedMontoRange,
                    min: e.target.value,
                  })
                }
              />
              <Input
                id="montoMax"
                type="number"
                placeholder="Máximo"
                value={selectedMontoRange.max}
                onChange={(e) =>
                  setMontoRange({
                    ...selectedMontoRange,
                    max: e.target.value,
                  })
                }
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleMontoFilter}
              className="w-full"
            >
              Aplicar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
