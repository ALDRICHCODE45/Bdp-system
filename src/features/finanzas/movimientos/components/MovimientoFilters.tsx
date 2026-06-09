"use client";

import { useState, useEffect } from "react";
import { Filter, SlidersHorizontal, FileSpreadsheet, RotateCcw, Plus } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import { format, parse } from "date-fns";
import type { ExportOptions } from "@/core/shared/components/DataTable/ExportButton";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/core/shared/ui/card";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import { Separator } from "@/core/shared/ui/separator";
import { DatePicker } from "@/core/shared/ui/date-picker";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { FilterMultiSelect } from "@/core/shared/components/DataTable/FilterMultiSelect";
import { FilterHeaderActions } from "@/core/shared/components/DataTable/FilterHeaderActions";
import { ColumnVisibilitySelector } from "@/core/shared/components/DataTable/ColumnVisibilitySelector";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { cn } from "@/core/lib/utils";
import { SectionHeader } from "./forms/MovimientoFormField";
import type { MovimientoFilterInput } from "../server/actions/getMovimientosAction";

// ─── Filter option enums ──────────────────────────────────────────────────────

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

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MovimientoFiltersProps {
  table?: Table<unknown> | null;
  filters: MovimientoFilterInput;
  onFiltersChange: (filters: MovimientoFilterInput) => void;
  onImport?: () => void;
  onExport?: (table: Table<unknown>, options?: ExportOptions) => void;
  onAdd?: () => void;
  onClearFilters?: () => void;
  /** Titulares list for multi-select (from useDistinctTitulares) */
  titulares?: string[];
}

// ─── Count active advanced filters ───────────────────────────────────────────

function countAdvancedFilters(f: MovimientoFilterInput): number {
  let count = 0;
  if (f.facturadoPor && f.facturadoPor.length > 0) count++;
  if (f.titular && f.titular.length > 0) count++;
  if (f.fechaOperacionFrom || f.fechaOperacionTo) count++;
  if (f.fechaCorteFrom || f.fechaCorteTo) count++;
  if (f.montoMin != null || f.montoMax != null) count++;
  return count;
}

// ─── Empty advanced draft ─────────────────────────────────────────────────────

function emptyDraft(): AdvancedDraft {
  return {
    facturadoPor: [],
    titular: [],
    fechaOperacionFrom: "",
    fechaOperacionTo: "",
    fechaCorteFrom: "",
    fechaCorteTo: "",
    montoMin: "",
    montoMax: "",
  };
}

interface AdvancedDraft {
  facturadoPor: string[];
  titular: string[];
  fechaOperacionFrom: string;
  fechaOperacionTo: string;
  fechaCorteFrom: string;
  fechaCorteTo: string;
  montoMin: string;
  montoMax: string;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

const strToDate = (s: string): Date | undefined => {
  if (!s) return undefined;
  try {
    return parse(s, "yyyy-MM-dd", new Date());
  } catch {
    return undefined;
  }
};

const dateToStr = (d: Date | undefined): string =>
  d ? format(d, "yyyy-MM-dd") : "";

// ─── Sub-components ───────────────────────────────────────────────────────────

function DateRange({
  label,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
}: {
  label: string;
  fromValue: string;
  toValue: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Desde</Label>
          <DatePicker
            date={strToDate(fromValue)}
            onDateChange={(d) => onFromChange(dateToStr(d))}
            placeholder="Desde"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Hasta</Label>
          <DatePicker
            date={strToDate(toValue)}
            onDateChange={(d) => onToChange(dateToStr(d))}
            placeholder="Hasta"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

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
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<AdvancedDraft>(emptyDraft());

  const advancedCount = countAdvancedFilters(filters);

  // Sync draft when sheet opens
  useEffect(() => {
    if (sheetOpen) {
      setDraft({
        facturadoPor: (filters.facturadoPor as string[]) ?? [],
        titular: filters.titular ?? [],
        fechaOperacionFrom: filters.fechaOperacionFrom ?? "",
        fechaOperacionTo: filters.fechaOperacionTo ?? "",
        fechaCorteFrom: filters.fechaCorteFrom ?? "",
        fechaCorteTo: filters.fechaCorteTo ?? "",
        montoMin: filters.montoMin != null ? String(filters.montoMin) : "",
        montoMax: filters.montoMax != null ? String(filters.montoMax) : "",
      });
    }
  }, [sheetOpen, filters]);

  if (!table) return null;

  const update = (partial: Partial<MovimientoFilterInput>) =>
    onFiltersChange({ ...filters, ...partial, page: 1 });

  const handleClearAll = () => {
    onClearFilters?.();
  };

  const handleApply = () => {
    onFiltersChange({
      ...filters,
      facturadoPor: draft.facturadoPor.length > 0
        ? (draft.facturadoPor as MovimientoFilterInput["facturadoPor"])
        : undefined,
      titular: draft.titular.length > 0 ? draft.titular : undefined,
      fechaOperacionFrom: draft.fechaOperacionFrom || undefined,
      fechaOperacionTo: draft.fechaOperacionTo || undefined,
      fechaCorteFrom: draft.fechaCorteFrom || undefined,
      fechaCorteTo: draft.fechaCorteTo || undefined,
      montoMin: draft.montoMin ? Number(draft.montoMin) : undefined,
      montoMax: draft.montoMax ? Number(draft.montoMax) : undefined,
      page: 1,
    });
    setSheetOpen(false);
  };

  const handleReset = () => {
    setDraft(emptyDraft());
  };

  const setDraftField = <K extends keyof AdvancedDraft>(key: K, value: AdvancedDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

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
              AddButtonIcon={Plus}
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

            {/* Advanced filters trigger */}
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
                Filtros avanzados
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

      {/* ── Advanced filters sheet ────────────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={cn(
            "p-0 w-full sm:max-w-2xl",
            isMobile
              ? "rounded-t-2xl max-h-[92dvh] flex flex-col overflow-hidden"
              : "rounded-2xl flex flex-col overflow-hidden"
          )}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b shrink-0">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <SheetTitle>Filtros avanzados</SheetTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Filtrá movimientos con criterios adicionales. Los cambios aplican al presionar &ldquo;Aplicar filtros&rdquo;.
            </p>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* ── Identificación ─────────────────────────────────────── */}
            <section className="space-y-4">
              <SectionHeader title="Identificación" />
              <FilterMultiSelect
                label="Facturado por"
                options={FACTURADO_POR_OPTIONS}
                selected={draft.facturadoPor}
                onChange={(v) => setDraftField("facturadoPor", v)}
                placeholder="Todos"
              />
              <FilterMultiSelect
                label="Titular"
                options={titulares.map((t) => ({ label: t, value: t }))}
                selected={draft.titular}
                onChange={(v) => setDraftField("titular", v)}
                placeholder="Todos"
              />
            </section>

            <Separator />

            {/* ── Fechas ─────────────────────────────────────────────── */}
            <section className="space-y-4">
              <SectionHeader title="Fechas" />
              <DateRange
                label="Fecha de operación"
                fromValue={draft.fechaOperacionFrom}
                toValue={draft.fechaOperacionTo}
                onFromChange={(v) => setDraftField("fechaOperacionFrom", v)}
                onToChange={(v) => setDraftField("fechaOperacionTo", v)}
              />
              <DateRange
                label="Fecha de corte"
                fromValue={draft.fechaCorteFrom}
                toValue={draft.fechaCorteTo}
                onFromChange={(v) => setDraftField("fechaCorteFrom", v)}
                onToChange={(v) => setDraftField("fechaCorteTo", v)}
              />
            </section>

            <Separator />

            {/* ── Monto ──────────────────────────────────────────────── */}
            <section className="space-y-4">
              <SectionHeader title="Monto" />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Mínimo</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="$0"
                    value={draft.montoMin}
                    onChange={(e) => setDraftField("montoMin", e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Máximo</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Sin límite"
                    value={draft.montoMax}
                    onChange={(e) => setDraftField("montoMax", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Sticky footer */}
          <div className="border-t px-6 py-4 flex gap-3 bg-background shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpiar
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Aplicar filtros
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
