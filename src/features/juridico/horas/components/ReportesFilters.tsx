"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { Button } from "@/core/shared/ui/button";
import { Label } from "@/core/shared/ui/label";
import { X } from "lucide-react";
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

export function ReportesFilters({
  filters,
  onFiltersChange,
}: ReportesFiltersProps) {
  const { data: equipos } = useGetEquiposJuridicos();
  const { data: clientes } = useGetClientesJuridicos();
  const { data: asuntos } = useGetAsuntosJuridicos();
  const { data: socios } = useGetSocios();
  const { data: usuarios } = useGetActiveUsersForReporte();

  const years = generateYears();
  const weeks = generateWeeks();

  const handleChange = (key: keyof ReporteHorasFilters, value: string | number | undefined) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== ""
  );

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
        {/* Equipo */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Equipo</Label>
          <Select
            value={filters.equipoJuridicoId ?? TODOS_VALUE}
            onValueChange={(val) =>
              handleChange(
                "equipoJuridicoId",
                val === TODOS_VALUE ? undefined : val
              )
            }
          >
            <SelectTrigger className="h-8 text-sm">
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
              handleChange(
                "clienteJuridicoId",
                val === TODOS_VALUE ? undefined : val
              )
            }
          >
            <SelectTrigger className="h-8 text-sm">
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
              handleChange(
                "asuntoJuridicoId",
                val === TODOS_VALUE ? undefined : val
              )
            }
          >
            <SelectTrigger className="h-8 text-sm">
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
              handleChange("socioId", val === TODOS_VALUE ? undefined : val)
            }
          >
            <SelectTrigger className="h-8 text-sm">
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
              handleChange("usuarioId", val === TODOS_VALUE ? undefined : val)
            }
          >
            <SelectTrigger className="h-8 text-sm">
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
              handleChange(
                "ano",
                val === TODOS_VALUE ? undefined : Number(val)
              )
            }
          >
            <SelectTrigger className="h-8 text-sm">
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
              handleChange(
                "semanaDesde",
                val === TODOS_VALUE ? undefined : Number(val)
              )
            }
          >
            <SelectTrigger className="h-8 text-sm">
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
              handleChange(
                "semanaHasta",
                val === TODOS_VALUE ? undefined : Number(val)
              )
            }
          >
            <SelectTrigger className="h-8 text-sm">
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
      </div>
    </div>
  );
}
