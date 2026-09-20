"use client";

import { useEffect, useState } from "react";
import { format, parse } from "date-fns";
import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import { Separator } from "@/core/shared/ui/separator";
import { DatePicker } from "@/core/shared/ui/date-picker";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { FilterMultiSelect } from "@/core/shared/components/DataTable/FilterMultiSelect";
import { SectionHeader } from "../forms/MovimientoFormField";
import type { MovimientoFilterInput } from "../../server/actions/getMovimientosAction";

// ── Opciones de filtros (espejo de MovimientoFilters) ───────────────────────
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

// ── Draft shape ──────────────────────────────────────────────────────────────
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

// ── Date helpers ─────────────────────────────────────────────────────────────
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

function countActiveFilters(f: MovimientoFilterInput): number {
  let count = 0;
  if ((f.estado?.length ?? 0) > 0) count++;
  if ((f.categoria?.length ?? 0) > 0) count++;
  if ((f.formaPago?.length ?? 0) > 0) count++;
  if ((f.cargoAbono?.length ?? 0) > 0) count++;
  if ((f.facturadoPor?.length ?? 0) > 0) count++;
  if ((f.titular?.length ?? 0) > 0) count++;
  if (f.fechaOperacionFrom || f.fechaOperacionTo) count++;
  if (f.fechaCorteFrom || f.fechaCorteTo) count++;
  if (f.montoMin != null || f.montoMax != null) count++;
  return count;
}

// ── Sub-components ───────────────────────────────────────────────────────────

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
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
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

// ── Props ────────────────────────────────────────────────────────────────────
interface MovimientoMobileFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: MovimientoFilterInput;
  onApply: (filters: MovimientoFilterInput) => void;
  onClearFilters: () => void;
  titulares?: string[];
}

export function MovimientoMobileFiltersDrawer({
  open,
  onOpenChange,
  filters,
  onApply,
  onClearFilters,
  titulares = [],
}: MovimientoMobileFiltersDrawerProps) {
  const [draft, setDraft] = useState<AdvancedDraft>(emptyDraft());
  const [quick, setQuick] = useState({
    estado: [] as string[],
    categoria: [] as string[],
    formaPago: [] as string[],
    cargoAbono: [] as string[],
  });

  // Sync draft when the sheet opens
  useEffect(() => {
    if (!open) return;
    setQuick({
      estado: (filters.estado as string[]) ?? [],
      categoria: (filters.categoria as string[]) ?? [],
      formaPago: (filters.formaPago as string[]) ?? [],
      cargoAbono: (filters.cargoAbono as string[]) ?? [],
    });
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
  }, [open, filters]);

  const hasActiveFilters = countActiveFilters(filters) > 0;

  const setDraftField = <K extends keyof AdvancedDraft>(
    key: K,
    value: AdvancedDraft[K],
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const handleReset = () => {
    setQuick({ estado: [], categoria: [], formaPago: [], cargoAbono: [] });
    setDraft(emptyDraft());
  };

  const handleApply = () => {
    onApply({
      ...filters,
      estado: quick.estado.length
        ? (quick.estado as MovimientoFilterInput["estado"])
        : undefined,
      categoria: quick.categoria.length
        ? (quick.categoria as MovimientoFilterInput["categoria"])
        : undefined,
      formaPago: quick.formaPago.length
        ? (quick.formaPago as MovimientoFilterInput["formaPago"])
        : undefined,
      cargoAbono: quick.cargoAbono.length
        ? (quick.cargoAbono as MovimientoFilterInput["cargoAbono"])
        : undefined,
      facturadoPor: draft.facturadoPor.length
        ? (draft.facturadoPor as MovimientoFilterInput["facturadoPor"])
        : undefined,
      titular: draft.titular.length ? draft.titular : undefined,
      fechaOperacionFrom: draft.fechaOperacionFrom || undefined,
      fechaOperacionTo: draft.fechaOperacionTo || undefined,
      fechaCorteFrom: draft.fechaCorteFrom || undefined,
      fechaCorteTo: draft.fechaCorteTo || undefined,
      montoMin: draft.montoMin ? Number(draft.montoMin) : undefined,
      montoMax: draft.montoMax ? Number(draft.montoMax) : undefined,
      page: 1,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[85vh] flex flex-col p-0"
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
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
          <section className="space-y-4">
            <SectionHeader title="Filtros rápidos" />
            <FilterMultiSelect
              label="Estado"
              options={ESTADO_OPTIONS}
              selected={quick.estado}
              onChange={(v) => setQuick((p) => ({ ...p, estado: v }))}
              placeholder="Todos"
            />
            <FilterMultiSelect
              label="Categoría"
              options={CATEGORIA_OPTIONS}
              selected={quick.categoria}
              onChange={(v) => setQuick((p) => ({ ...p, categoria: v }))}
              placeholder="Todas"
            />
            <FilterMultiSelect
              label="Forma Pago"
              options={FORMA_PAGO_OPTIONS}
              selected={quick.formaPago}
              onChange={(v) => setQuick((p) => ({ ...p, formaPago: v }))}
              placeholder="Todas"
            />
            <FilterMultiSelect
              label="Cargo/Abono"
              options={CARGO_ABONO_OPTIONS}
              selected={quick.cargoAbono}
              onChange={(v) => setQuick((p) => ({ ...p, cargoAbono: v }))}
              placeholder="Todos"
            />
          </section>

          <Separator />

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
        <div className="border-t px-4 py-4 flex gap-3 bg-background shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1.5"
          >
            Limpiar
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Aplicar filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
