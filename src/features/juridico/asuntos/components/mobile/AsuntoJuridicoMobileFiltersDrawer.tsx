"use client";

import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import { Checkbox } from "@/core/shared/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";

const ESTADOS = [
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" },
  { value: "CERRADO", label: "Cerrado" },
] as const;

interface AsuntoJuridicoMobileFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (v: string) => void;
  estado: string[];
  onEstadoChange: (estado: string[]) => void;
  onClearFilters: () => void;
}

export function AsuntoJuridicoMobileFiltersDrawer({
  open,
  onOpenChange,
  search,
  onSearchChange,
  estado,
  onEstadoChange,
  onClearFilters,
}: AsuntoJuridicoMobileFiltersDrawerProps) {
  const hasActiveFilters = search.length > 0 || estado.length > 0;

  const toggleEstado = (value: string) => {
    if (estado.includes(value)) {
      onEstadoChange(estado.filter((e) => e !== value));
    } else {
      onEstadoChange([...estado, value]);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[80vh] flex flex-col p-0"
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
                onClick={() => {
                  onClearFilters();
                }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
          {/* Búsqueda */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Búsqueda
            </Label>
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Nombre, descripción, cliente, socio..."
              className="h-9 text-sm"
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Estado
            </Label>
            <div className="space-y-2">
              {ESTADOS.map((e) => (
                <div key={e.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`estado-${e.value}`}
                    checked={estado.includes(e.value)}
                    onCheckedChange={() => toggleEstado(e.value)}
                  />
                  <Label
                    htmlFor={`estado-${e.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {e.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botón Aplicar */}
        <div className="px-4 pb-6 pt-3 border-t shrink-0">
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Aplicar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
