"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { Button } from "@/core/shared/ui/button";
import { Badge } from "@/core/shared/ui/badge";
import { Label } from "@/core/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { Combobox } from "@/core/shared/ui/combobox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { useGetClientesJuridicos } from "@/features/juridico/clientes/hooks/useGetClientesJuridicos.hook";
import { useGetEquiposJuridicos } from "@/features/juridico/equipos/hooks/useGetEquiposJuridicos.hook";
import type { DashboardHorasFilters } from "../../server/dtos/DashboardHorasDto.dto";

type Props = {
  filters: DashboardHorasFilters;
  onChange: (filters: DashboardHorasFilters) => void;
};

const TODOS_VALUE = "__todos__";

const generateWeeks = () => Array.from({ length: 53 }, (_, i) => i + 1);
const generateYears = () => {
  const current = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => current - i);
};

function FilterFields({
  filters,
  update,
  triggerClass,
}: {
  filters: DashboardHorasFilters;
  update: (key: keyof DashboardHorasFilters, value: string | number | undefined) => void;
  triggerClass: string;
}) {
  const { data: equipos } = useGetEquiposJuridicos();
  const { data: clientes } = useGetClientesJuridicos();
  const weeks = generateWeeks();
  const years = generateYears();
  const weekOptions = [
    { value: TODOS_VALUE, label: "Todas" },
    ...weeks.map((week) => ({ value: String(week), label: `Sem ${week}` })),
  ];

  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Año</Label>
        <Select
          value={filters.ano !== undefined ? String(filters.ano) : TODOS_VALUE}
          onValueChange={(value) => update("ano", value === TODOS_VALUE ? undefined : Number(value))}
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="Todos los años" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_VALUE}>Todos</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Semana desde</Label>
        <Combobox
          options={weekOptions}
          value={filters.semanaDesde !== undefined ? String(filters.semanaDesde) : TODOS_VALUE}
          onChange={(value) =>
            update("semanaDesde", value === TODOS_VALUE ? undefined : Number(value))
          }
          placeholder="Desde"
          searchPlaceholder="Buscar semana..."
          emptyMessage="Sin coincidencias."
          className={triggerClass}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Semana hasta</Label>
        <Combobox
          options={weekOptions}
          value={filters.semanaHasta !== undefined ? String(filters.semanaHasta) : TODOS_VALUE}
          onChange={(value) =>
            update("semanaHasta", value === TODOS_VALUE ? undefined : Number(value))
          }
          placeholder="Hasta"
          searchPlaceholder="Buscar semana..."
          emptyMessage="Sin coincidencias."
          className={triggerClass}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Equipo</Label>
        <Select
          value={filters.equipoJuridicoId ?? TODOS_VALUE}
          onValueChange={(value) =>
            update("equipoJuridicoId", value === TODOS_VALUE ? undefined : value)
          }
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="Todos los equipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_VALUE}>Todos</SelectItem>
            {equipos?.map((equipo) => (
              <SelectItem key={equipo.id} value={equipo.id}>
                {equipo.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Cliente</Label>
        <Select
          value={filters.clienteJuridicoId ?? TODOS_VALUE}
          onValueChange={(value) =>
            update("clienteJuridicoId", value === TODOS_VALUE ? undefined : value)
          }
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="Todos los clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_VALUE}>Todos</SelectItem>
            {clientes?.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

export function DashboardFilters({ filters, onChange }: Props) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const update = (key: keyof DashboardHorasFilters, value: string | number | undefined) => {
    onChange({ ...filters, [key]: value });
  };

  const currentYear = new Date().getFullYear();
  const resetFilters = () => onChange({ ano: currentYear });
  const activeFilterCount = Object.values(filters).filter((value) => value !== undefined).length;
  const hasActiveFilters = activeFilterCount > 0;

  if (isMobile) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 justify-start gap-2"
            onClick={() => setOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {hasActiveFilters ? <Badge className="ml-auto size-5 p-0 text-[10px]">{activeFilterCount}</Badge> : null}
          </Button>
          {hasActiveFilters ? (
            <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={resetFilters}>
              <X className="h-3.5 w-3.5 mr-1" />
              Limpiar
            </Button>
          ) : null}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] p-0 flex flex-col">
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>
            <SheetHeader className="px-4 pb-2">
              <SheetTitle className="text-base">Filtros del dashboard</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto px-4 pb-5">
              <div className="grid grid-cols-1 gap-3">
                <FilterFields filters={filters} update={update} triggerClass="h-10" />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Filtros</h3>
        <Button variant="ghost" size="sm" className="text-xs" onClick={resetFilters}>
          Limpiar filtros
        </Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <FilterFields filters={filters} update={update} triggerClass="h-10 text-sm" />
      </div>
    </div>
  );
}
