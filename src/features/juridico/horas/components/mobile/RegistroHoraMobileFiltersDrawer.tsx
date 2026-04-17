"use client";

import { useState, useEffect } from "react";
import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";

import { getEquiposJuridicosAction } from "@/features/juridico/equipos/server/actions/getEquiposJuridicosAction";
import { getClientesJuridicosAction } from "@/features/juridico/clientes/server/actions/getClientesJuridicosAction";

type SelectOption = { id: string; nombre: string };

interface RegistroHoraMobileFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Valores actuales
  search: string;
  onSearchChange: (v: string) => void;
  equipoJuridicoId?: string;
  onEquipoChange: (id: string | undefined) => void;
  clienteJuridicoId?: string;
  onClienteChange: (id: string | undefined) => void;
  ano?: number;
  onAnoChange: (ano: number | undefined) => void;
  onClearFilters: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

export function RegistroHoraMobileFiltersDrawer({
  open,
  onOpenChange,
  search,
  onSearchChange,
  equipoJuridicoId,
  onEquipoChange,
  clienteJuridicoId,
  onClienteChange,
  ano,
  onAnoChange,
  onClearFilters,
}: RegistroHoraMobileFiltersDrawerProps) {
  const [equipos, setEquipos] = useState<SelectOption[]>([]);
  const [clientes, setClientes] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch options when drawer opens
  useEffect(() => {
    if (!open) return;
    if (equipos.length > 0 && clientes.length > 0) return;

    setIsLoading(true);
    Promise.all([getEquiposJuridicosAction(), getClientesJuridicosAction()])
      .then(([equiposResult, clientesResult]) => {
        if (equiposResult.ok) {
          setEquipos(
            equiposResult.data.map((e) => ({ id: e.id, nombre: e.nombre }))
          );
        }
        if (clientesResult.ok) {
          setClientes(
            clientesResult.data.map((c) => ({ id: c.id, nombre: c.nombre }))
          );
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [open, equipos.length, clientes.length]);

  const hasActiveFilters =
    search.length > 0 ||
    !!equipoJuridicoId ||
    !!clienteJuridicoId ||
    !!ano;

  const handleClear = () => {
    onClearFilters();
    onEquipoChange(undefined);
    onClienteChange(undefined);
    onAnoChange(undefined);
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
                onClick={handleClear}
              >
                Limpiar
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {/* Búsqueda */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Búsqueda
            </Label>
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Abogado, cliente, asunto, descripción..."
              className="h-9 text-sm"
            />
          </div>

          {/* Equipo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Equipo
            </Label>
            <Select
              value={equipoJuridicoId ?? "__all__"}
              onValueChange={(v) => onEquipoChange(v === "__all__" ? undefined : v)}
              disabled={isLoading}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Todos los equipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los equipos</SelectItem>
                {equipos.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cliente */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Cliente
            </Label>
            <Select
              value={clienteJuridicoId ?? "__all__"}
              onValueChange={(v) => onClienteChange(v === "__all__" ? undefined : v)}
              disabled={isLoading}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Todos los clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los clientes</SelectItem>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Año */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Año
            </Label>
            <Select
              value={ano ? String(ano) : "__all__"}
              onValueChange={(v) => onAnoChange(v === "__all__" ? undefined : Number(v))}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Todos los años" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los años</SelectItem>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
