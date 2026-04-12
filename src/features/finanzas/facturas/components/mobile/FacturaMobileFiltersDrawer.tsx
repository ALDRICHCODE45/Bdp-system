"use client";

import { Button } from "@/core/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { FilterMultiSelect } from "@/core/shared/components/DataTable/FilterMultiSelect";

// ── Opciones de filtros rápidos (espejo de FacturasTableFilters) ────────────
const metodoPagoOptions = [
  { label: "PUE", value: "PUE" },
  { label: "PPD", value: "PPD" },
];

const medioPagoOptions = [
  { label: "Transferencia", value: "Transferencia" },
  { label: "Depósito", value: "Depósito" },
  { label: "Efectivo", value: "Efectivo" },
  { label: "Cheque", value: "Cheque" },
];

const monedaOptions = [
  { label: "MXN", value: "MXN" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
];

const statusPagoOptions = [
  { label: "Pagado", value: "Pagado" },
  { label: "Pendiente de pago", value: "Pendiente de pago" },
  { label: "Cancelada", value: "Cancelada" },
];

interface FacturaMobileFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metodoPago: string[];
  onMetodoPagoChange: (v: string[]) => void;
  medioPago: string[];
  onMedioPagoChange: (v: string[]) => void;
  moneda: string[];
  onMonedaChange: (v: string[]) => void;
  statusPago: string[];
  onStatusPagoChange: (v: string[]) => void;
  onClearFilters: () => void;
}

export function FacturaMobileFiltersDrawer({
  open,
  onOpenChange,
  metodoPago,
  onMetodoPagoChange,
  medioPago,
  onMedioPagoChange,
  moneda,
  onMonedaChange,
  statusPago,
  onStatusPagoChange,
  onClearFilters,
}: FacturaMobileFiltersDrawerProps) {
  const hasActiveFilters =
    metodoPago.length > 0 ||
    medioPago.length > 0 ||
    moneda.length > 0 ||
    statusPago.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[80vh] flex flex-col p-0"
      >
        {/* Handle visual */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <SheetHeader className="px-4 pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold">Filtros</SheetTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground h-7 px-2"
                onClick={onClearFilters}
              >
                Limpiar todo
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Filtros scrolleables */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          <FilterMultiSelect
            label="Forma de Pago"
            options={metodoPagoOptions}
            selected={metodoPago}
            onChange={onMetodoPagoChange}
            placeholder="Todos"
          />
          <FilterMultiSelect
            label="Método de Pago"
            options={medioPagoOptions}
            selected={medioPago}
            onChange={onMedioPagoChange}
            placeholder="Todos"
          />
          <FilterMultiSelect
            label="Moneda"
            options={monedaOptions}
            selected={moneda}
            onChange={onMonedaChange}
            placeholder="Todas"
          />
          <FilterMultiSelect
            label="Status de Pago"
            options={statusPagoOptions}
            selected={statusPago}
            onChange={onStatusPagoChange}
            placeholder="Todos"
          />
        </div>

        {/* Botón Aplicar */}
        <div className="px-4 pb-6 pt-3 border-t shrink-0">
          <Button
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Aplicar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
