"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { Combobox } from "@/core/shared/ui/combobox";
import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import { Badge } from "@/core/shared/ui/badge";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { cn } from "@/core/lib/utils";
import { useReporteEntities } from "./ReporteHorasAgrupadoProvider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import type { ReporteHorasAgrupadoFiltersState } from "../types/ReporteHorasAgrupadoFilters.type";

const TODOS_VALUE = "__todos__";

const ESTADO_OPTIONS = [
  { value: TODOS_VALUE, label: "Todos" },
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" },
  { value: "CERRADO", label: "Cerrado" },
];

function generateYears(): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - i);
}

function generateWeeks(): number[] {
  return Array.from({ length: 53 }, (_, i) => i + 1);
}

interface ReporteHorasAgrupadoFiltersProps {
  filters: ReporteHorasAgrupadoFiltersState;
  onFiltersChange: (filters: ReporteHorasAgrupadoFiltersState) => void;
}

// ─── Advanced draft (the 7 non-quick controls) ──────────────────────────────

interface AdvancedDraft {
  asuntoJuridicoId: string | undefined;
  clienteProveedorId: string | undefined;
  equipoJuridicoId: string | undefined;
  socioId: string | undefined;
  estado: ReporteHorasAgrupadoFiltersState["estado"];
  horasDesde: number | undefined;
  horasHasta: number | undefined;
}

function emptyDraft(): AdvancedDraft {
  return {
    asuntoJuridicoId: undefined,
    clienteProveedorId: undefined,
    equipoJuridicoId: undefined,
    socioId: undefined,
    estado: undefined,
    horasDesde: undefined,
    horasHasta: undefined,
  };
}

function draftFromFilters(f: ReporteHorasAgrupadoFiltersState): AdvancedDraft {
  return {
    asuntoJuridicoId: f.asuntoJuridicoId,
    clienteProveedorId: f.clienteProveedorId,
    equipoJuridicoId: f.equipoJuridicoId,
    socioId: f.socioId,
    estado: f.estado,
    horasDesde: f.horasDesde,
    horasHasta: f.horasHasta,
  };
}

function countActiveAdvancedFilters(f: ReporteHorasAgrupadoFiltersState): number {
  let count = 0;
  if (f.asuntoJuridicoId) count++;
  if (f.clienteProveedorId) count++;
  if (f.equipoJuridicoId) count++;
  if (f.socioId) count++;
  if (f.estado) count++;
  if (f.horasDesde !== undefined) count++;
  if (f.horasHasta !== undefined) count++;
  return count;
}

// ─── Quick controls (Periodo + Abogado) ─────────────────────────────────────

interface QuickFieldsProps {
  filters: ReporteHorasAgrupadoFiltersState;
  onChange: (
    key: keyof ReporteHorasAgrupadoFiltersState,
    value: string | number | undefined,
  ) => void;
  usuarios: { id: string; name: string }[] | undefined;
  years: number[];
  weeks: number[];
}

function QuickFields({
  filters,
  onChange,
  usuarios,
  years,
  weeks,
}: QuickFieldsProps) {
  const weekOptions = useMemo(
    () => [
      { value: TODOS_VALUE, label: "Todas" },
      ...weeks.map((w) => ({ value: String(w), label: `Sem ${w}` })),
    ],
    [weeks],
  );
  const yearOptions = useMemo(
    () => [
      { value: TODOS_VALUE, label: "Todos" },
      ...years.map((y) => ({ value: String(y), label: String(y) })),
    ],
    [years],
  );

  return (
    <>
      {/* Abogado */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Abogado</Label>
        <Combobox
          options={[
            { value: TODOS_VALUE, label: "Todos" },
            ...(usuarios?.map((u) => ({ value: u.id, label: u.name })) ?? []),
          ]}
          value={filters.usuarioId ?? TODOS_VALUE}
          onChange={(val) =>
            onChange("usuarioId", val === TODOS_VALUE ? undefined : val)
          }
          placeholder="Todos los abogados"
          searchPlaceholder="Buscar abogado..."
          className="h-8 text-sm"
        />
      </div>

      {/* Año */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Año</Label>
        <Combobox
          options={yearOptions}
          value={filters.ano !== undefined ? String(filters.ano) : TODOS_VALUE}
          onChange={(val) =>
            onChange("ano", val === TODOS_VALUE ? undefined : Number(val))
          }
          placeholder="Todos los años"
          searchPlaceholder="Buscar año..."
          className="h-8 text-sm"
        />
      </div>

      {/* Semana desde */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Semana desde</Label>
        <Combobox
          options={weekOptions}
          value={
            filters.semanaDesde !== undefined
              ? String(filters.semanaDesde)
              : TODOS_VALUE
          }
          onChange={(val) =>
            onChange(
              "semanaDesde",
              val === TODOS_VALUE ? undefined : Number(val),
            )
          }
          placeholder="Desde"
          searchPlaceholder="Buscar semana..."
          className="h-8 text-sm"
        />
      </div>

      {/* Semana hasta */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Semana hasta</Label>
        <Combobox
          options={weekOptions}
          value={
            filters.semanaHasta !== undefined
              ? String(filters.semanaHasta)
              : TODOS_VALUE
          }
          onChange={(val) =>
            onChange(
              "semanaHasta",
              val === TODOS_VALUE ? undefined : Number(val),
            )
          }
          placeholder="Hasta"
          searchPlaceholder="Buscar semana..."
          className="h-8 text-sm"
        />
      </div>
    </>
  );
}

// ─── Advanced controls (the 7 non-quick fields) ─────────────────────────────

interface AdvancedFieldsProps {
  draft: AdvancedDraft;
  setDraft: React.Dispatch<React.SetStateAction<AdvancedDraft>>;
  equipos: { id: string; nombre: string }[] | undefined;
  clientes: { id: string; nombre: string }[] | undefined;
  asuntos: { id: string; nombre: string }[] | undefined;
  socios: { id: string; nombre: string }[] | undefined;
}

function AdvancedFields({
  draft,
  setDraft,
  equipos,
  clientes,
  asuntos,
  socios,
}: AdvancedFieldsProps) {
  const update = <K extends keyof AdvancedDraft>(
    key: K,
    value: AdvancedDraft[K],
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      {/* Asunto */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Asunto</Label>
        <Combobox
          options={[
            { value: TODOS_VALUE, label: "Todos" },
            ...(asuntos?.map((a) => ({ value: a.id, label: a.nombre })) ?? []),
          ]}
          value={draft.asuntoJuridicoId ?? TODOS_VALUE}
          onChange={(val) =>
            update(
              "asuntoJuridicoId",
              val === TODOS_VALUE ? undefined : val,
            )
          }
          placeholder="Todos los asuntos"
          searchPlaceholder="Buscar asunto..."
          className="h-9 text-sm w-full"
        />
      </div>

      {/* Cliente */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Cliente</Label>
        <Combobox
          options={[
            { value: TODOS_VALUE, label: "Todos" },
            ...(clientes?.map((c) => ({ value: c.id, label: c.nombre })) ?? []),
          ]}
          value={draft.clienteProveedorId ?? TODOS_VALUE}
          onChange={(val) =>
            update(
              "clienteProveedorId",
              val === TODOS_VALUE ? undefined : val,
            )
          }
          placeholder="Todos los clientes"
          searchPlaceholder="Buscar cliente..."
          className="h-9 text-sm w-full"
        />
      </div>

      {/* Equipo */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Equipo</Label>
        <Combobox
          options={[
            { value: TODOS_VALUE, label: "Todos" },
            ...(equipos?.map((e) => ({ value: e.id, label: e.nombre })) ?? []),
          ]}
          value={draft.equipoJuridicoId ?? TODOS_VALUE}
          onChange={(val) =>
            update(
              "equipoJuridicoId",
              val === TODOS_VALUE ? undefined : val,
            )
          }
          placeholder="Todos los equipos"
          searchPlaceholder="Buscar equipo..."
          className="h-9 text-sm w-full"
        />
      </div>

      {/* Socio */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Socio</Label>
        <Combobox
          options={[
            { value: TODOS_VALUE, label: "Todos" },
            ...(socios?.map((s) => ({ value: s.id, label: s.nombre })) ?? []),
          ]}
          value={draft.socioId ?? TODOS_VALUE}
          onChange={(val) =>
            update("socioId", val === TODOS_VALUE ? undefined : val)
          }
          placeholder="Todos los socios"
          searchPlaceholder="Buscar socio..."
          className="h-9 text-sm w-full"
        />
      </div>

      {/* Estado del asunto */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Estado asunto</Label>
        <Select
          value={draft.estado ?? TODOS_VALUE}
          onValueChange={(val) =>
            update(
              "estado",
              val === TODOS_VALUE
                ? undefined
                : (val as ReporteHorasAgrupadoFiltersState["estado"]),
            )
          }
        >
          <SelectTrigger className="h-9 text-sm w-full">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            {ESTADO_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Horas mín / máx */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Horas mín.</Label>
        <Input
          type="number"
          step="0.5"
          min={0}
          placeholder="0"
          value={draft.horasDesde ?? ""}
          onChange={(e) =>
            update(
              "horasDesde",
              e.target.value === "" ? undefined : Number(e.target.value),
            )
          }
          className="h-9 text-sm w-full"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Horas máx.</Label>
        <Input
          type="number"
          step="0.5"
          min={0}
          placeholder="Sin tope"
          value={draft.horasHasta ?? ""}
          onChange={(e) =>
            update(
              "horasHasta",
              e.target.value === "" ? undefined : Number(e.target.value),
            )
          }
          className="h-9 text-sm w-full"
        />
      </div>
    </>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function ReporteHorasAgrupadoFilters({
  filters,
  onFiltersChange,
}: ReporteHorasAgrupadoFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<AdvancedDraft>(emptyDraft());
  const isMobile = useIsMobile();

  const { equipos, clientes, asuntos, socios, usuarios } = useReporteEntities();

  const years = useMemo(generateYears, []);
  const weeks = useMemo(generateWeeks, []);

  const advancedCount = countActiveAdvancedFilters(filters);

  // Sync draft whenever the sheet reopens — edits without "Aplicar" never
  // mutate the canonical filter state, so we restore from the active filters.
  useEffect(() => {
    if (sheetOpen) setDraft(draftFromFilters(filters));
  }, [sheetOpen, filters]);

  const handleChange = (
    key: keyof ReporteHorasAgrupadoFiltersState,
    value: string | number | undefined,
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleReset = () => onFiltersChange({});

  const handleApply = () => {
    onFiltersChange({
      ...filters,
      asuntoJuridicoId: draft.asuntoJuridicoId,
      clienteProveedorId: draft.clienteProveedorId,
      equipoJuridicoId: draft.equipoJuridicoId,
      socioId: draft.socioId,
      estado: draft.estado,
      horasDesde: draft.horasDesde,
      horasHasta: draft.horasHasta,
    });
    setSheetOpen(false);
  };

  const handleResetDraft = () => setDraft(emptyDraft());

  const hasActiveFilters = advancedCount > 0 || Object.values(filters).some(
    (v) =>
      v !== undefined &&
      v !== "" &&
      // Ignore the 7 advanced fields when counting here — they are summarized by advancedCount.
      ![
        filters.asuntoJuridicoId,
        filters.clienteProveedorId,
        filters.equipoJuridicoId,
        filters.socioId,
        filters.estado,
        filters.horasDesde,
        filters.horasHasta,
      ].includes(v),
  );

  // ── Mobile: full Sheet with all 11 controls ─────────────────────────────
  if (isMobile) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 h-9 justify-start"
            onClick={() => setSheetOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0" />
            <span className="text-sm">Filtros</span>
            {(advancedCount > 0 || hasActiveFilters) && (
              <Badge className="ml-auto size-5 p-0 flex items-center justify-center text-[10px]">
                {advancedCount +
                  (Object.values(filters).filter(
                    (v) =>
                      v !== undefined &&
                      v !== "" &&
                      ![
                        filters.asuntoJuridicoId,
                        filters.clienteProveedorId,
                        filters.equipoJuridicoId,
                        filters.socioId,
                        filters.estado,
                        filters.horasDesde,
                        filters.horasHasta,
                      ].includes(v),
                  ).length)}
              </Badge>
            )}
          </Button>
          {(advancedCount > 0 || hasActiveFilters) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Limpiar
            </Button>
          )}
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl max-h-[85vh] flex flex-col p-0"
          >
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>

            <SheetHeader className="px-4 pb-3 shrink-0">
              <SheetTitle className="text-base font-semibold">Filtros</SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              <QuickFields
                filters={filters}
                onChange={handleChange}
                usuarios={usuarios}
                years={years}
                weeks={weeks}
              />
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  Filtros avanzados
                </p>
                <AdvancedFields
                  draft={draft}
                  setDraft={setDraft}
                  equipos={equipos}
                  clientes={clientes}
                  asuntos={asuntos}
                  socios={socios}
                />
              </div>
            </div>

            <div className="border-t bg-background shrink-0 px-4 py-3 flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleResetDraft}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Limpiar
              </Button>
              <Button className="flex-1" onClick={handleApply}>
                Aplicar filtros
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // ── Desktop: quick row + "Más filtros" button → advanced Sheet ──────────
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <QuickFields
          filters={filters}
          onChange={handleChange}
          usuarios={usuarios}
          years={years}
          weeks={weeks}
        />

        {/* "Más filtros" trigger */}
        <div className="space-y-1.5">
          <span className="block text-xs text-muted-foreground">
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className={cn(
            "p-0 w-full sm:max-w-xl",
            "rounded-2xl flex flex-col overflow-hidden",
          )}
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <SheetTitle>Filtros avanzados</SheetTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Filtrá el reporte con criterios detallados. Los cambios aplican al
              presionar &ldquo;Aplicar filtros&rdquo;.
            </p>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <AdvancedFields
              draft={draft}
              setDraft={setDraft}
              equipos={equipos}
              clientes={clientes}
              asuntos={asuntos}
              socios={socios}
            />
          </div>

          <div className="border-t px-6 py-4 flex gap-3 bg-background shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleResetDraft}
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
    </div>
  );
}
