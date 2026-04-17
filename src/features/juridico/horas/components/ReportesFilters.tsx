"use client";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { Button } from "@/core/shared/ui/button";
import { Badge } from "@/core/shared/ui/badge";
import { Label } from "@/core/shared/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { X, SlidersHorizontal } from "lucide-react";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { useGetEquiposJuridicos } from "@/features/juridico/equipos/hooks/useGetEquiposJuridicos.hook";
import { useGetClientesJuridicos } from "@/features/juridico/clientes/hooks/useGetClientesJuridicos.hook";
import { useGetAsuntosJuridicos } from "@/features/juridico/asuntos/hooks/useGetAsuntosJuridicos.hook";
import { useGetSocios } from "../hooks/useGetSocios.hook";
import { useGetActiveUsersForReporte } from "../hooks/useGetActiveUsersForReporte.hook";
import type { ReporteHorasFilters } from "../server/dtos/ReporteHorasDto.dto";

interface ReportesFiltersProps {
  filters: ReporteHorasFilters;
  onFiltersChange: (filters: ReporteHorasFilters) => void;
}

const TODOS_VALUE = "__todos__";

// Generate last 5 years
function generateYears(): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - i);
}

// Generate weeks 1-53
function generateWeeks(): number[] {
  return Array.from({ length: 53 }, (_, i) => i + 1);
}

// ── Shared filter fields ──────────────────────────────────────────────────────

interface FilterFieldsProps {
  filters: ReporteHorasFilters;
  onChange: (key: keyof ReporteHorasFilters, value: string | number | undefined) => void;
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
  return (
    <>
      {/* Equipo */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Equipo</Label>
        <Select
          value={filters.equipoJuridicoId ?? TODOS_VALUE}
          onValueChange={(val) =>
            onChange("equipoJuridicoId", val === TODOS_VALUE ? undefined : val)
          }
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="Todos los equipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_VALUE}>Todos</SelectItem>
            {equipos?.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cliente */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Cliente</Label>
        <Select
          value={filters.clienteJuridicoId ?? TODOS_VALUE}
          onValueChange={(val) =>
            onChange("clienteJuridicoId", val === TODOS_VALUE ? undefined : val)
          }
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="Todos los clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_VALUE}>Todos</SelectItem>
            {clientes?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Asunto */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Asunto</Label>
        <Select
          value={filters.asuntoJuridicoId ?? TODOS_VALUE}
          onValueChange={(val) =>
            onChange("asuntoJuridicoId", val === TODOS_VALUE ? undefined : val)
          }
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="Todos los asuntos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_VALUE}>Todos</SelectItem>
            {asuntos?.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Socio */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Socio</Label>
        <Select
          value={filters.socioId ?? TODOS_VALUE}
          onValueChange={(val) =>
            onChange("socioId", val === TODOS_VALUE ? undefined : val)
          }
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="Todos los socios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_VALUE}>Todos</SelectItem>
            {socios?.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Abogado / Usuario */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Abogado</Label>
        <Select
          value={filters.usuarioId ?? TODOS_VALUE}
          onValueChange={(val) =>
            onChange("usuarioId", val === TODOS_VALUE ? undefined : val)
          }
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="Todos los abogados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_VALUE}>Todos</SelectItem>
            {usuarios?.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Año */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Año</Label>
        <Select
          value={filters.ano !== undefined ? String(filters.ano) : TODOS_VALUE}
          onValueChange={(val) =>
            onChange("ano", val === TODOS_VALUE ? undefined : Number(val))
          }
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="Todos los años" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_VALUE}>Todos</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Semana Desde */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Semana desde</Label>
        <Select
          value={
            filters.semanaDesde !== undefined
              ? String(filters.semanaDesde)
              : TODOS_VALUE
          }
          onValueChange={(val) =>
            onChange(
              "semanaDesde",
              val === TODOS_VALUE ? undefined : Number(val)
            )
          }
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="Desde" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_VALUE}>Todas</SelectItem>
            {weeks.map((w) => (
              <SelectItem key={w} value={String(w)}>
                Sem {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Semana Hasta */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Semana hasta</Label>
        <Select
          value={
            filters.semanaHasta !== undefined
              ? String(filters.semanaHasta)
              : TODOS_VALUE
          }
          onValueChange={(val) =>
            onChange(
              "semanaHasta",
              val === TODOS_VALUE ? undefined : Number(val)
            )
          }
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="Hasta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_VALUE}>Todas</SelectItem>
            {weeks.map((w) => (
              <SelectItem key={w} value={String(w)}>
                Sem {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ReportesFilters({
  filters,
  onFiltersChange,
}: ReportesFiltersProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: equipos } = useGetEquiposJuridicos();
  const { data: clientes } = useGetClientesJuridicos();
  const { data: asuntos } = useGetAsuntosJuridicos();
  const { data: socios } = useGetSocios();
  const { data: usuarios } = useGetActiveUsersForReporte();

  const years = generateYears();
  const weeks = generateWeeks();

  const handleChange = (
    key: keyof ReporteHorasFilters,
    value: string | number | undefined
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== ""
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

  // ── Mobile: compact bar + bottom sheet ────────────────────────────────────
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
            {/* Handle visual */}
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
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

            {/* Filter fields */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              <FilterFields {...sharedProps} triggerClass="h-9 text-sm w-full" />
            </div>

            {/* Apply button */}
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

  // ── Desktop: grid layout ──────────────────────────────────────────────────
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
