"use client";

import { Table } from "@tanstack/react-table";
import { LucideIcon, SlidersHorizontal, FileSpreadsheet } from "lucide-react";
import type { ExportOptions } from "@/core/shared/components/DataTable/ExportButton";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/core/shared/ui/card";
import { Filter } from "lucide-react";
import { FilterMultiSelect } from "@/core/shared/components/DataTable/FilterMultiSelect";
import { FilterHeaderActions } from "@/core/shared/components/DataTable/FilterHeaderActions";
import { BaseFilterProps } from "@/core/shared/components/DataTable/types";
import { FacturasAdvancedFilters, countActiveAdvancedFilters } from "../types/FacturasAdvancedFilters.type";
import { FacturasAdvancedFiltersSheet } from "./FacturasAdvancedFiltersSheet";
import { useState } from "react";

// ── Opciones de los filtros rápidos ──────────────────────────────────────────
const metodoPagoOptions = [
  { label: "CHEQUE", value: "CHEQUE" },
  { label: "TRANSFERENCIA", value: "TRANSFERENCIA" },
  { label: "EFECTIVO", value: "EFECTIVO" },
  { label: "PUE", value: "PUE" },
  { label: "PPD", value: "PPD" },
];

const monedaOptions = [
  { label: "MXN", value: "MXN" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
];

const statusPagoOptions = [
  { label: "Vigente", value: "Vigente" },
  { label: "Cancelado", value: "Cancelado" },
  { label: "No Pagado", value: "NoPagado" },
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface FacturasFiltersProps extends BaseFilterProps {
  table: Table<unknown>;
  onGlobalFilterChange?: (value: string) => void;
  addButtonText?: string;
  addButtonIcon?: LucideIcon;
  showAddButton?: boolean;
  onAdd?: () => void;
  onExport?: (table: Table<unknown>, options?: ExportOptions) => void;
  onImport?: () => void;
  // Quick filters (multi-select)
  metodoPago?: string[];
  onMetodoPagoChange?: (value: string[]) => void;
  moneda?: string[];
  onMonedaChange?: (value: string[]) => void;
  statusPago?: string[];
  onStatusPagoChange?: (value: string[]) => void;
  onClearFilters?: () => void;
  // Advanced filters
  advancedFilters?: FacturasAdvancedFilters;
  onApplyAdvancedFilters?: (filters: FacturasAdvancedFilters) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────
export function FacturasFilters({
  table,
  onGlobalFilterChange,
  addButtonIcon,
  addButtonText = "Agregar",
  showAddButton,
  onAdd,
  onExport,
  onImport,
  metodoPago = [],
  onMetodoPagoChange,
  moneda = [],
  onMonedaChange,
  statusPago = [],
  onStatusPagoChange,
  onClearFilters,
  advancedFilters,
  onApplyAdvancedFilters,
}: FacturasFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeAdvancedCount = advancedFilters
    ? countActiveAdvancedFilters(advancedFilters)
    : 0;

  const handleClearAll = () => {
    onClearFilters?.();
    onGlobalFilterChange?.("");
  };

  return (
    <>
      <Card className="mb-6 w-full min-w-0">
        {/* ── Header ── */}
        <CardHeader className="pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Filter className="h-5 w-5 text-primary flex-shrink-0" />
            <Badge variant="outline" className="flex-shrink-0">
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
              onClearFilters={handleClearAll}
              onExport={onExport}
              table={table}
              exportFileName="facturas"
              isServerSide={true}
            />
          </div>
        </CardHeader>

        {/* ── Filtros rápidos + botón Filtros avanzados ── */}
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <FilterMultiSelect
              label="Método de Pago"
              options={metodoPagoOptions}
              selected={metodoPago}
              onChange={(v) => onMetodoPagoChange?.(v)}
              placeholder="Todos"
            />
            <FilterMultiSelect
              label="Moneda"
              options={monedaOptions}
              selected={moneda}
              onChange={(v) => onMonedaChange?.(v)}
              placeholder="Todas"
            />
            <FilterMultiSelect
              label="Status de Pago"
              options={statusPagoOptions}
              selected={statusPago}
              onChange={(v) => onStatusPagoChange?.(v)}
              placeholder="Todos"
            />

            {/* Botón Filtros avanzados */}
            <div className="space-y-2">
              <span className="block text-xs font-medium text-muted-foreground">
                Más filtros
              </span>
              <Button
                variant="outline"
                className="w-full gap-2 relative"
                onClick={() => setSheetOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {activeAdvancedCount > 0 && (
                  <Badge className="ml-auto h-5 min-w-5 px-1 text-xs flex items-center justify-center">
                    {activeAdvancedCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sheet de filtros avanzados */}
      {onApplyAdvancedFilters && advancedFilters && (
        <FacturasAdvancedFiltersSheet
          isOpen={sheetOpen}
          onOpenChange={setSheetOpen}
          appliedFilters={advancedFilters}
          onApply={onApplyAdvancedFilters}
        />
      )}
    </>
  );
}
