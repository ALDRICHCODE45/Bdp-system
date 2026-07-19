"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import { Separator } from "@/core/shared/ui/separator";
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { FilterMultiSelect } from "@/core/shared/components/DataTable/FilterMultiSelect";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { cn } from "@/core/lib/utils";
import { useGetAsuntosJuridicos } from "@/features/juridico/asuntos/hooks/useGetAsuntosJuridicos.hook";
import { useGetSocios } from "../hooks/useGetSocios.hook";
import {
  EMPTY_REGISTRO_HORAS_ADVANCED_FILTERS,
  type RegistroHorasAdvancedFilters,
} from "../types/RegistroHorasAdvancedFilters.type";

interface RegistroHorasAdvancedFiltersSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appliedFilters: RegistroHorasAdvancedFilters;
  onApply: (filters: RegistroHorasAdvancedFilters) => void;
}

function generateYears(): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - i);
}

function generateWeeks(): number[] {
  return Array.from({ length: 53 }, (_, i) => i + 1);
}

const ALL_VALUE = "__all__";

export function RegistroHorasAdvancedFiltersSheet({
  isOpen,
  onOpenChange,
  appliedFilters,
  onApply,
}: RegistroHorasAdvancedFiltersSheetProps) {
  const isMobile = useIsMobile();
  const [draft, setDraft] = useState<RegistroHorasAdvancedFilters>(appliedFilters);
  const { data: asuntos } = useGetAsuntosJuridicos();
  const { data: socios } = useGetSocios();

  useEffect(() => {
    if (isOpen) setDraft(appliedFilters);
  }, [isOpen, appliedFilters]);

  const asuntoOptions = useMemo(
    () => (asuntos ?? []).map((a) => ({ value: a.id, label: a.nombre })),
    [asuntos]
  );
  const socioOptions = useMemo(
    () => (socios ?? []).map((s) => ({ value: s.id, label: s.nombre })),
    [socios]
  );

  const years = useMemo(generateYears, []);
  const weeks = useMemo(generateWeeks, []);
  const weekOptions = useMemo(
    () => [
      { value: ALL_VALUE, label: "Todas" },
      ...weeks.map((week) => ({ value: String(week), label: String(week) })),
    ],
    [weeks]
  );

  const handleApply = () => {
    onApply(draft);
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "p-0 w-full sm:max-w-xl",
          isMobile
            ? "rounded-t-3xl max-h-[92dvh] flex flex-col overflow-hidden"
            : "rounded-3xl overflow-y-auto"
        )}
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <SheetTitle>Filtros avanzados</SheetTitle>
          </div>
          <SheetDescription>
            Ajusta filtros detallados para el registro de horas.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <FilterMultiSelect
            label="Asunto"
            options={asuntoOptions}
            selected={draft.asuntoJuridicoIds}
            onChange={(v) => setDraft((prev) => ({ ...prev, asuntoJuridicoIds: v }))}
            placeholder="Todos los asuntos"
          />
          <FilterMultiSelect
            label="Socio"
            options={socioOptions}
            selected={draft.socioIds}
            onChange={(v) => setDraft((prev) => ({ ...prev, socioIds: v }))}
            placeholder="Todos los socios"
          />

          <Separator />

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Año</Label>
              <Select
                value={draft.ano !== undefined ? String(draft.ano) : ALL_VALUE}
                onValueChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    ano: value === ALL_VALUE ? undefined : Number(value),
                  }))
                }
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Semana desde</Label>
              <Combobox
                options={weekOptions}
                value={
                  draft.semanaDesde !== undefined
                    ? String(draft.semanaDesde)
                    : ALL_VALUE
                }
                onChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    semanaDesde:
                      value === ALL_VALUE ? undefined : Number(value),
                  }))
                }
                placeholder="Todas"
                searchPlaceholder="Buscar semana..."
                emptyMessage="Sin coincidencias."
                className="h-9 w-full"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Semana hasta</Label>
              <Combobox
                options={weekOptions}
                value={
                  draft.semanaHasta !== undefined
                    ? String(draft.semanaHasta)
                    : ALL_VALUE
                }
                onChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    semanaHasta:
                      value === ALL_VALUE ? undefined : Number(value),
                  }))
                }
                placeholder="Todas"
                searchPlaceholder="Buscar semana..."
                emptyMessage="Sin coincidencias."
                className="h-9 w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Horas mín</Label>
              <Input
                type="number"
                min={0}
                value={draft.horasMin}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, horasMin: e.target.value }))
                }
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Horas máx</Label>
              <Input
                type="number"
                min={0}
                value={draft.horasMax}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, horasMax: e.target.value }))
                }
                placeholder="Sin límite"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Fecha desde</Label>
              <Input
                type="date"
                value={draft.fechaRegistroDesde}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, fechaRegistroDesde: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Fecha hasta</Label>
              <Input
                type="date"
                value={draft.fechaRegistroHasta}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, fechaRegistroHasta: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4 flex gap-3 bg-background">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setDraft(EMPTY_REGISTRO_HORAS_ADVANCED_FILTERS)}
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
  );
}
