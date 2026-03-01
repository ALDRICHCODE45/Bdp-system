"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { Button } from "@/core/shared/ui/button";
import { Label } from "@/core/shared/ui/label";
import { Input } from "@/core/shared/ui/input";
import { Separator } from "@/core/shared/ui/separator";
import { FilterMultiSelect } from "@/core/shared/components/DataTable/FilterMultiSelect";
import { TagInput } from "@/core/shared/components/DataTable/TagInput";
import { DatePicker } from "@/features/Recepcion/entradas-salidas/components/DatePicker";
import { useAllUsers } from "../hooks/useAllUsers.hook";
import { parse } from "date-fns";
import { format } from "date-fns";
import {
  FacturasAdvancedFilters,
  EMPTY_ADVANCED_FILTERS,
} from "../types/FacturasAdvancedFilters.type";
import { useMemo } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";

const USO_CFDI_OPTIONS = [
  "G01",
  "G02",
  "G03",
  "I01",
  "I02",
  "I03",
  "I04",
  "I05",
  "I06",
  "I07",
  "I08",
  "D01",
  "D02",
  "D03",
  "D04",
  "D05",
  "D06",
  "D07",
  "D08",
  "D09",
  "D10",
  "CP01",
  "S01",
].map((v) => ({ value: v, label: v }));

interface FacturasAdvancedFiltersSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appliedFilters: FacturasAdvancedFilters;
  onApply: (filters: FacturasAdvancedFilters) => void;
}

// ── Helpers de conversión de fecha ───────────────────────────────────────────
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

// ── Sub-componente: sección de rango numérico ─────────────────────────────────
interface NumRangeProps {
  label: string;
  minValue: string;
  maxValue: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}

function NumRange({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: NumRangeProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Mínimo</Label>
          <Input
            type="number"
            min={0}
            placeholder="$0"
            value={minValue}
            onChange={(e) => onMinChange(e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Máximo</Label>
          <Input
            type="number"
            min={0}
            placeholder="Sin límite"
            value={maxValue}
            onChange={(e) => onMaxChange(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}

// ── Sub-componente: sección de rango de fecha ─────────────────────────────────
interface DateRangeProps {
  label: string;
  fromValue: string;
  toValue: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}

function DateRange({
  label,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
}: DateRangeProps) {
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

// ── Componente principal ──────────────────────────────────────────────────────
export function FacturasAdvancedFiltersSheet({
  isOpen,
  onOpenChange,
  appliedFilters,
  onApply,
}: FacturasAdvancedFiltersSheetProps) {
  const isMobile = useIsMobile();

  // Draft: copia local que se aplica solo al presionar "Aplicar"
  const [draft, setDraft] = useState<FacturasAdvancedFilters>(appliedFilters);

  // Sincronizar draft cuando se abra el sheet con los filtros aplicados actuales
  useEffect(() => {
    if (isOpen) {
      setDraft(appliedFilters);
    }
  }, [isOpen, appliedFilters]);

  // Helpers para actualizar el draft sin mutar directamente
  const set = <K extends keyof FacturasAdvancedFilters>(
    key: K,
    value: FacturasAdvancedFilters[K],
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  // Usuarios para el select "Ingresado por"
  const { data: users = [] } = useAllUsers();
  const userOptions = useMemo(
    () => users.map((u) => ({ value: u.id, label: u.name || u.email })),
    [users],
  );

  const handleApply = () => {
    onApply(draft);
    onOpenChange(false);
  };

  const handleReset = () => {
    setDraft(EMPTY_ADVANCED_FILTERS);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="rounded-3xl overflow-y-auto p-0 w-full sm:max-w-2xl"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <SheetTitle>Filtros avanzados</SheetTitle>
          </div>
          <SheetDescription>
            Filtra las facturas con criterios adicionales. Los cambios aplican
            al presionar &ldquo;Aplicar&rdquo;.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* ── Identificación ───────────────────────────────────── */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Identificación
            </h3>
            <TagInput
              label="UUID"
              values={draft.uuid}
              onChange={(v) => set("uuid", v)}
              placeholder="Pegar UUID parcial o completo y Enter…"
            />
            <FilterMultiSelect
              label="Uso CFDI"
              options={USO_CFDI_OPTIONS}
              selected={draft.usoCfdi}
              onChange={(v) => set("usoCfdi", v)}
              placeholder="Todos los usos"
            />
          </section>

          <Separator />

          {/* ── Emisor ───────────────────────────────────────────── */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Emisor
            </h3>
            <TagInput
              label="RFC Emisor"
              values={draft.rfcEmisor}
              onChange={(v) => set("rfcEmisor", v)}
              placeholder="Ej: XAXX010101000 y Enter…"
            />
            <TagInput
              label="Nombre Emisor"
              values={draft.nombreEmisor}
              onChange={(v) => set("nombreEmisor", v)}
              placeholder="Nombre o parte del nombre y Enter…"
            />
          </section>

          <Separator />

          {/* ── Receptor ─────────────────────────────────────────── */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Receptor
            </h3>
            <TagInput
              label="RFC Receptor"
              values={draft.rfcReceptor}
              onChange={(v) => set("rfcReceptor", v)}
              placeholder="Ej: XAXX010101000 y Enter…"
            />
            <TagInput
              label="Nombre Receptor"
              values={draft.nombreReceptor}
              onChange={(v) => set("nombreReceptor", v)}
              placeholder="Nombre o parte del nombre y Enter…"
            />
          </section>

          <Separator />

          {/* ── Montos ───────────────────────────────────────────── */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Montos
            </h3>
            <NumRange
              label="Subtotal"
              minValue={draft.subtotalMin}
              maxValue={draft.subtotalMax}
              onMinChange={(v) => set("subtotalMin", v)}
              onMaxChange={(v) => set("subtotalMax", v)}
            />
            <NumRange
              label="Total"
              minValue={draft.totalMin}
              maxValue={draft.totalMax}
              onMinChange={(v) => set("totalMin", v)}
              onMaxChange={(v) => set("totalMax", v)}
            />
            <NumRange
              label="Impuestos Trasladados"
              minValue={draft.impTrasladosMin}
              maxValue={draft.impTrasladosMax}
              onMinChange={(v) => set("impTrasladosMin", v)}
              onMaxChange={(v) => set("impTrasladosMax", v)}
            />
            <NumRange
              label="Impuestos Retenidos"
              minValue={draft.impRetenidosMin}
              maxValue={draft.impRetenidosMax}
              onMinChange={(v) => set("impRetenidosMin", v)}
              onMaxChange={(v) => set("impRetenidosMax", v)}
            />
          </section>

          <Separator />

          {/* ── Pago ─────────────────────────────────────────────── */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pago
            </h3>
            <DateRange
              label="Fecha de Pago"
              fromValue={draft.fechaPagoFrom}
              toValue={draft.fechaPagoTo}
              onFromChange={(v) => set("fechaPagoFrom", v)}
              onToChange={(v) => set("fechaPagoTo", v)}
            />
          </section>

          <Separator />

          {/* ── Auditoría ─────────────────────────────────────────── */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Auditoría
            </h3>
            <FilterMultiSelect
              label="Ingresado por"
              options={userOptions}
              selected={draft.ingresadoPor}
              onChange={(v) => set("ingresadoPor", v)}
              placeholder="Todos los usuarios"
            />
            <DateRange
              label="Fecha de creación"
              fromValue={draft.createdAtFrom}
              toValue={draft.createdAtTo}
              onFromChange={(v) => set("createdAtFrom", v)}
              onToChange={(v) => set("createdAtTo", v)}
            />
            <DateRange
              label="Última actualización"
              fromValue={draft.updatedAtFrom}
              toValue={draft.updatedAtTo}
              onFromChange={(v) => set("updatedAtFrom", v)}
              onToChange={(v) => set("updatedAtTo", v)}
            />
          </section>
        </div>

        {/* Footer fijo con botones */}
        <div className="border-t px-6 py-4 flex gap-3 bg-background">
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
  );
}
