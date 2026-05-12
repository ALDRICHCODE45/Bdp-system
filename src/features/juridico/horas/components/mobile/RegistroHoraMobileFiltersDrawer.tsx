"use client";

import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { FilterMultiSelect } from "@/core/shared/components/DataTable/FilterMultiSelect";
import { useGetEquiposJuridicos } from "@/features/juridico/equipos/hooks/useGetEquiposJuridicos.hook";
import { useGetClientesJuridicos } from "@/features/juridico/clientes/hooks/useGetClientesJuridicos.hook";
import { useGetAsuntosJuridicos } from "@/features/juridico/asuntos/hooks/useGetAsuntosJuridicos.hook";
import { useGetSocios } from "../../hooks/useGetSocios.hook";
import { useGetActiveUsersForReporte } from "../../hooks/useGetActiveUsersForReporte.hook";
import type { RegistroHorasAdvancedFilters } from "../../types/RegistroHorasAdvancedFilters.type";

interface RegistroHoraMobileFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (v: string) => void;
  equipoJuridicoIds: string[];
  onEquipoChange: (ids: string[]) => void;
  clienteJuridicoIds: string[];
  onClienteChange: (ids: string[]) => void;
  usuarioIds: string[];
  onUsuarioChange: (ids: string[]) => void;
  canFilterByUsuario: boolean;
  advancedFilters: RegistroHorasAdvancedFilters;
  onAdvancedFiltersChange: (filters: RegistroHorasAdvancedFilters) => void;
  onClearFilters: () => void;
}

function generateYears(): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - i);
}

function generateWeeks(): number[] {
  return Array.from({ length: 53 }, (_, i) => i + 1);
}

const ALL_VALUE = "__all__";

export function RegistroHoraMobileFiltersDrawer({
  open,
  onOpenChange,
  search,
  onSearchChange,
  equipoJuridicoIds,
  onEquipoChange,
  clienteJuridicoIds,
  onClienteChange,
  usuarioIds,
  onUsuarioChange,
  canFilterByUsuario,
  advancedFilters,
  onAdvancedFiltersChange,
  onClearFilters,
}: RegistroHoraMobileFiltersDrawerProps) {
  const years = generateYears();
  const weeks = generateWeeks();

  const { data: equipos } = useGetEquiposJuridicos();
  const { data: clientes } = useGetClientesJuridicos();
  const { data: asuntos } = useGetAsuntosJuridicos();
  const { data: socios } = useGetSocios();
  const { data: usuarios } = useGetActiveUsersForReporte(canFilterByUsuario);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] flex flex-col p-0">
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        <SheetHeader className="px-4 pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold">Filtros</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground h-7 px-2"
              onClick={onClearFilters}
            >
              Limpiar
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Busqueda</Label>
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Abogado, cliente, asunto, descripcion..."
              className="h-9 text-sm"
            />
          </div>

          <FilterMultiSelect
            label="Equipo"
            options={(equipos ?? []).map((e) => ({ value: e.id, label: e.nombre }))}
            selected={equipoJuridicoIds}
            onChange={onEquipoChange}
            placeholder="Todos"
          />

          <FilterMultiSelect
            label="Cliente"
            options={(clientes ?? []).map((c) => ({ value: c.id, label: c.nombre }))}
            selected={clienteJuridicoIds}
            onChange={onClienteChange}
            placeholder="Todos"
          />

          {canFilterByUsuario && (
            <FilterMultiSelect
              label="Abogado"
              options={(usuarios ?? []).map((u) => ({ value: u.id, label: u.name || u.email }))}
              selected={usuarioIds}
              onChange={onUsuarioChange}
              placeholder="Todos"
            />
          )}

          <FilterMultiSelect
            label="Asunto"
            options={(asuntos ?? []).map((a) => ({ value: a.id, label: a.nombre }))}
            selected={advancedFilters.asuntoJuridicoIds}
            onChange={(value) =>
              onAdvancedFiltersChange({ ...advancedFilters, asuntoJuridicoIds: value })
            }
            placeholder="Todos"
          />

          <FilterMultiSelect
            label="Socio"
            options={(socios ?? []).map((s) => ({ value: s.id, label: s.nombre }))}
            selected={advancedFilters.socioIds}
            onChange={(value) =>
              onAdvancedFiltersChange({ ...advancedFilters, socioIds: value })
            }
            placeholder="Todos"
          />

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Ano</Label>
              <select
                className="w-full h-9 rounded-md border bg-background px-2 text-sm"
                value={advancedFilters.ano !== undefined ? String(advancedFilters.ano) : ALL_VALUE}
                onChange={(e) =>
                  onAdvancedFiltersChange({
                    ...advancedFilters,
                    ano: e.target.value === ALL_VALUE ? undefined : Number(e.target.value),
                  })
                }
              >
                <option value={ALL_VALUE}>Todos</option>
                {years.map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Semana desde</Label>
              <select
                className="w-full h-9 rounded-md border bg-background px-2 text-sm"
                value={
                  advancedFilters.semanaDesde !== undefined
                    ? String(advancedFilters.semanaDesde)
                    : ALL_VALUE
                }
                onChange={(e) =>
                  onAdvancedFiltersChange({
                    ...advancedFilters,
                    semanaDesde:
                      e.target.value === ALL_VALUE ? undefined : Number(e.target.value),
                  })
                }
              >
                <option value={ALL_VALUE}>Todas</option>
                {weeks.map((week) => (
                  <option key={week} value={String(week)}>
                    {week}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Semana hasta</Label>
              <select
                className="w-full h-9 rounded-md border bg-background px-2 text-sm"
                value={
                  advancedFilters.semanaHasta !== undefined
                    ? String(advancedFilters.semanaHasta)
                    : ALL_VALUE
                }
                onChange={(e) =>
                  onAdvancedFiltersChange({
                    ...advancedFilters,
                    semanaHasta:
                      e.target.value === ALL_VALUE ? undefined : Number(e.target.value),
                  })
                }
              >
                <option value={ALL_VALUE}>Todas</option>
                {weeks.map((week) => (
                  <option key={week} value={String(week)}>
                    {week}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Horas min</Label>
              <Input
                type="number"
                min={0}
                value={advancedFilters.horasMin}
                onChange={(e) =>
                  onAdvancedFiltersChange({ ...advancedFilters, horasMin: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Horas max</Label>
              <Input
                type="number"
                min={0}
                value={advancedFilters.horasMax}
                onChange={(e) =>
                  onAdvancedFiltersChange({ ...advancedFilters, horasMax: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Fecha desde</Label>
              <Input
                type="date"
                value={advancedFilters.fechaRegistroDesde}
                onChange={(e) =>
                  onAdvancedFiltersChange({
                    ...advancedFilters,
                    fechaRegistroDesde: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fecha hasta</Label>
              <Input
                type="date"
                value={advancedFilters.fechaRegistroHasta}
                onChange={(e) =>
                  onAdvancedFiltersChange({
                    ...advancedFilters,
                    fechaRegistroHasta: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="px-4 pb-6 pt-3 border-t shrink-0">
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Aplicar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
