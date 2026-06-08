"use client";

import { useState } from "react";
import { Filter, SlidersHorizontal, FileSpreadsheet } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import type { ExportOptions } from "@/core/shared/components/DataTable/ExportButton";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/core/shared/ui/card";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import { FilterMultiSelect } from "@/core/shared/components/DataTable/FilterMultiSelect";
import { FilterHeaderActions } from "@/core/shared/components/DataTable/FilterHeaderActions";
import { ColumnVisibilitySelector } from "@/core/shared/components/DataTable/ColumnVisibilitySelector";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import type { MovimientoFilterInput } from "../server/actions/getMovimientosAction";

// ---------------------------------------------------------------------------
// Filter option enums
// ---------------------------------------------------------------------------

const ESTADO_OPTIONS = [
  { label: "Pagado", value: "PAGADO" },
  { label: "Pendiente", value: "PENDIENTE" },
  { label: "Cancelado", value: "CANCELADO" },
];

const CATEGORIA_OPTIONS = [
  { label: "Facturacion", value: "FACTURACION" },
  { label: "Comisiones", value: "COMISIONES" },
  { label: "Disposicion", value: "DISPOSICION" },
  { label: "Bancarizaciones", value: "BANCARIZACIONES" },
  { label: "Gasto Op.", value: "GASTO_OP" },
  { label: "Honorarios", value: "HONORARIOS" },
  { label: "Servicios", value: "SERVICIOS" },
  { label: "Arrendamiento", value: "ARRENDAMIENTO" },
];

const FORMA_PAGO_OPTIONS = [
  { label: "Transferencia", value: "TRANSFERENCIA" },
  { label: "Efectivo", value: "EFECTIVO" },
  { label: "Cheque", value: "CHEQUE" },
];

const CARGO_ABONO_OPTIONS = [
  { label: "BDP", value: "BDP" },
  { label: "CALFC", value: "CALFC" },
  { label: "GLOBAL", value: "GLOBAL" },
  { label: "RJZ", value: "RJZ" },
  { label: "APP", value: "APP" },
];

const FACTURADO_POR_OPTIONS = [
  { label: "BDP", value: "BDP" },
  { label: "CALFC", value: "CALFC" },
  { label: "GLOBAL", value: "GLOBAL" },
  { label: "RGZ", value: "RGZ" },
  { label: "RJS", value: "RJS" },
  { label: "APP", value: "APP" },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MovimientoFiltersProps {
  table: Table<unknown>;
  filters: MovimientoFilterInput;
  onFiltersChange: (filters: MovimientoFilterInput) => void;
  // Header action callbacks
  onImport?: () => void;
  onExport?: (table: Table<unknown>, options?: ExportOptions) => void;
  onAdd?: () => void;
  onClearFilters?: () => void;
  /** Titulares list for multi-select (from useDistinctTitulares) */
  titulares?: string[];
}

// ---------------------------------------------------------------------------
// Count active advanced filters (excluding quick filters on the main card)
// ---------------------------------------------------------------------------

function countAdvancedFilters(f: MovimientoFilterInput): number {
  let count = 0;
  if (f.formaPago && f.formaPago.length > 0) count++;
  if (f.cargoAbono && f.cargoAbono.length > 0) count++;
  if (f.facturadoPor && f.facturadoPor.length > 0) count++;
  if (f.titular && f.titular.length > 0) count++;
  if (f.fechaOperacionFrom || f.fechaOperacionTo) count++;
  if (f.fechaCorteFrom || f.fechaCorteTo) count++;
  if (f.montoMin != null || f.montoMax != null) count++;
  return count;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MovimientoFilters({
  table,
  filters,
  onFiltersChange,
  onImport,
  onExport,
  onAdd,
  onClearFilters,
  titulares = [],
}: MovimientoFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const advancedCount = countAdvancedFilters(filters);

  const update = (partial: Partial<MovimientoFilterInput>) =>
    onFiltersChange({ ...filters, ...partial, page: 1 });

  const handleClearAll = () => {
    onClearFilters?.();
  };

  return (
    <>
      <Card className="mb-6 w-full min-w-0">
        {/* Header */}
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
            <ColumnVisibilitySelector table={table} />
            <FilterHeaderActions
              onClearFilters={handleClearAll}
              addButtonText="Agregar"
              buttonTooltipText="Agregar Movimiento"
              showAddButton={!!onAdd}
              onAdd={onAdd}
              onExport={onExport}
              table={table}
              exportFileName="movimientos"
              isServerSide={true}
            />
          </div>
        </CardHeader>

        {/* Quick filters */}
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <FilterMultiSelect
              label="Estado"
              options={ESTADO_OPTIONS}
              selected={(filters.estado as string[]) ?? []}
              onChange={(v) => update({ estado: v as MovimientoFilterInput["estado"] })}
              placeholder="Todos"
            />
            <FilterMultiSelect
              label="Categoria"
              options={CATEGORIA_OPTIONS}
              selected={(filters.categoria as string[]) ?? []}
              onChange={(v) => update({ categoria: v as MovimientoFilterInput["categoria"] })}
              placeholder="Todas"
            />
            <FilterMultiSelect
              label="Forma Pago"
              options={FORMA_PAGO_OPTIONS}
              selected={(filters.formaPago as string[]) ?? []}
              onChange={(v) => update({ formaPago: v as MovimientoFilterInput["formaPago"] })}
              placeholder="Todas"
            />
            <FilterMultiSelect
              label="Cargo/Abono"
              options={CARGO_ABONO_OPTIONS}
              selected={(filters.cargoAbono as string[]) ?? []}
              onChange={(v) => update({ cargoAbono: v as MovimientoFilterInput["cargoAbono"] })}
              placeholder="Todos"
            />

            {/* Advanced filters button */}
            <div className="space-y-2">
              <span className="block text-xs font-medium text-muted-foreground">
                Mas filtros
              </span>
              <Button
                variant="outline"
                className="w-full gap-2 relative"
                onClick={() => setSheetOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {advancedCount > 0 && (
                  <Badge className="ml-auto h-5 min-w-5 px-1 text-xs flex items-center justify-center">
                    {advancedCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced filters sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto w-[400px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>Filtros avanzados</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            {/* Facturado Por */}
            <FilterMultiSelect
              label="Facturado Por"
              options={FACTURADO_POR_OPTIONS}
              selected={(filters.facturadoPor as string[]) ?? []}
              onChange={(v) => update({ facturadoPor: v as MovimientoFilterInput["facturadoPor"] })}
              placeholder="Todos"
            />

            {/* Titular */}
            <FilterMultiSelect
              label="Titular"
              options={titulares.map((t) => ({ label: t, value: t }))}
              selected={filters.titular ?? []}
              onChange={(v) => update({ titular: v })}
              placeholder="Todos"
            />

            {/* Fecha Operacion range */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Fecha Operacion
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  className="text-xs"
                  value={filters.fechaOperacionFrom ?? ""}
                  onChange={(e) =>
                    update({
                      fechaOperacionFrom: e.target.value || undefined,
                    })
                  }
                  placeholder="Desde"
                />
                <Input
                  type="date"
                  className="text-xs"
                  value={filters.fechaOperacionTo ?? ""}
                  onChange={(e) =>
                    update({
                      fechaOperacionTo: e.target.value || undefined,
                    })
                  }
                  placeholder="Hasta"
                />
              </div>
            </div>

            {/* Fecha Corte range */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Fecha Corte
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  className="text-xs"
                  value={filters.fechaCorteFrom ?? ""}
                  onChange={(e) =>
                    update({
                      fechaCorteFrom: e.target.value || undefined,
                    })
                  }
                  placeholder="Desde"
                />
                <Input
                  type="date"
                  className="text-xs"
                  value={filters.fechaCorteTo ?? ""}
                  onChange={(e) =>
                    update({
                      fechaCorteTo: e.target.value || undefined,
                    })
                  }
                  placeholder="Hasta"
                />
              </div>
            </div>

            {/* Monto range */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Rango de Monto (MXN)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  className="text-xs"
                  value={filters.montoMin ?? ""}
                  onChange={(e) =>
                    update({
                      montoMin: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="Min"
                  min={0}
                  step={0.01}
                />
                <Input
                  type="number"
                  className="text-xs"
                  value={filters.montoMax ?? ""}
                  onChange={(e) =>
                    update({
                      montoMax: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="Max"
                  min={0}
                  step={0.01}
                />
              </div>
            </div>

            {/* Apply / Clear */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  handleClearAll();
                  setSheetOpen(false);
                }}
              >
                Limpiar todo
              </Button>
              <Button className="flex-1" onClick={() => setSheetOpen(false)}>
                Aplicar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
