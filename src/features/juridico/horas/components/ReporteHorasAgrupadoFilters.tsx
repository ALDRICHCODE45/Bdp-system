"use client";

import { useState } from "react";
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
import { X, SlidersHorizontal } from "lucide-react";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
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

interface FilterFieldsProps {
  filters: ReporteHorasAgrupadoFiltersState;
  onChange: (
    key: keyof ReporteHorasAgrupadoFiltersState,
    value: string | number | undefined,
  ) => void;
  equipos: { id: string; nombre: string }[] | undefined;
  clientes: { id: string; nombre: string }[] | undefined;
  asuntos: { id: string; nombre: string }[] | undefined;
  socios: { id: string; nombre: string }[] | undefined;
  usuarios: { id: string; name: string }[] | undefined;
  years: number[];
  weeks: number[];
  triggerClass?: string;
}

function FilterFields({
  filters,
  onChange,
  equipos,
  clientes,
  asuntos,
  socios,
  usuarios,
  years,
  weeks,
  triggerClass = "h-8 text-sm",
}: FilterFieldsProps) {
  const weekOptions = [
    { value: TODOS_VALUE, label: "Todas" },
    ...weeks.map((w) => ({ value: String(w), label: `Sem ${w}` })),
  ];
  const yearOptions = [
    { value: TODOS_VALUE, label: "Todos" },
    ...years.map((y) => ({ value: String(y), label: String(y) })),
  ];

  return (
    <>
      {/* Abogado / Usuario */}
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
          className={triggerClass}
        />
      </div>

      {/* Asunto */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Asunto</Label>
        <Combobox
          options={[
            { value: TODOS_VALUE, label: "Todos" },
            ...(asuntos?.map((a) => ({ value: a.id, label: a.nombre })) ?? []),
          ]}
          value={filters.asuntoJuridicoId ?? TODOS_VALUE}
          onChange={(val) =>
            onChange("asuntoJuridicoId", val === TODOS_VALUE ? undefined : val)
          }
          placeholder="Todos los asuntos"
          searchPlaceholder="Buscar asunto..."
          className={triggerClass}
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
          value={filters.clienteJuridicoId ?? TODOS_VALUE}
          onChange={(val) =>
            onChange("clienteJuridicoId", val === TODOS_VALUE ? undefined : val)
          }
          placeholder="Todos los clientes"
          searchPlaceholder="Buscar cliente..."
          className={triggerClass}
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
          value={filters.equipoJuridicoId ?? TODOS_VALUE}
          onChange={(val) =>
            onChange("equipoJuridicoId", val === TODOS_VALUE ? undefined : val)
          }
          placeholder="Todos los equipos"
          searchPlaceholder="Buscar equipo..."
          className={triggerClass}
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
          value={filters.socioId ?? TODOS_VALUE}
          onChange={(val) =>
            onChange("socioId", val === TODOS_VALUE ? undefined : val)
          }
          placeholder="Todos los socios"
          searchPlaceholder="Buscar socio..."
          className={triggerClass}
        />
      </div>

      {/* Estado del asunto */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Estado asunto</Label>
        <Select
          value={filters.estado ?? TODOS_VALUE}
          onValueChange={(val) =>
            onChange(
              "estado",
              val === TODOS_VALUE
                ? undefined
                : (val as ReporteHorasAgrupadoFiltersState["estado"]),
            )
          }
        >
          <SelectTrigger className={triggerClass}>
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

      {/* Horas desde */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Horas mín.</Label>
        <Input
          type="number"
          step="0.5"
          min={0}
          placeholder="0"
          value={filters.horasDesde ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onChange("horasDesde", val === "" ? undefined : Number(val));
          }}
          className={triggerClass}
        />
      </div>

      {/* Horas hasta */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Horas máx.</Label>
        <Input
          type="number"
          step="0.5"
          min={0}
          placeholder="Sin tope"
          value={filters.horasHasta ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onChange("horasHasta", val === "" ? undefined : Number(val));
          }}
          className={triggerClass}
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
          className={triggerClass}
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
          className={triggerClass}
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
          className={triggerClass}
        />
      </div>
    </>
  );
}

export function ReporteHorasAgrupadoFilters({
  filters,
  onFiltersChange,
}: ReporteHorasAgrupadoFiltersProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const { equipos, clientes, asuntos, socios, usuarios } = useReporteEntities();

  const years = generateYears();
  const weeks = generateWeeks();

  const handleChange = (
    key: keyof ReporteHorasAgrupadoFiltersState,
    value: string | number | undefined,
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== "",
  ).length;

  const hasActiveFilters = activeFilterCount > 0;

  const sharedProps = {
    filters,
    onChange: handleChange,
    equipos,
    clientes,
    asuntos,
    socios,
    usuarios,
    years,
    weeks,
  };

  if (isMobile) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 h-9 justify-start"
            onClick={() => setDrawerOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0" />
            <span className="text-sm">Filtros</span>
            {hasActiveFilters && (
              <Badge className="ml-auto size-5 p-0 flex items-center justify-center text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
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

        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl max-h-[85vh] flex flex-col p-0"
          >
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>

            <SheetHeader className="px-4 pb-3 shrink-0">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-base font-semibold">
                  Filtros
                </SheetTitle>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground h-7 px-2"
                    onClick={handleReset}
                  >
                    Limpiar
                  </Button>
                )}
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              <FilterFields
                {...sharedProps}
                triggerClass="h-9 text-sm w-full"
              />
            </div>

            <div className="px-4 pb-6 pt-3 border-t shrink-0">
              <Button className="w-full" onClick={() => setDrawerOpen(false)}>
                Aplicar
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <FilterFields {...sharedProps} />
      </div>
    </div>
  );
}
