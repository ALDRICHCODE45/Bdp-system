"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import { Calendar } from "@/core/shared/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/shared/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { FilterSelect } from "@/core/shared/components/DataTable/FilterSelect";
import { cn } from "@/core/lib/utils";
import {
  bancosOptions,
  estadosClienteProovedor,
  tipoClienteProovedorOptions,
} from "../../types/ClientesProovedoresFiltersOptions";

interface ClienteProveedorMobileFiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTipo: string;
  onTipoChange: (value: string) => void;
  selectedEstado: string;
  onEstadoChange: (value: string) => void;
  selectedBanco: string;
  onBancoChange: (value: string) => void;
  socioResponsableFilter: string;
  onSocioResponsableChange: (value: string) => void;
  selectedDateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onClearFilters: () => void;
}

export function ClienteProveedorMobileFiltersDrawer({
  open,
  onOpenChange,
  selectedTipo,
  onTipoChange,
  selectedEstado,
  onEstadoChange,
  selectedBanco,
  onBancoChange,
  socioResponsableFilter,
  onSocioResponsableChange,
  selectedDateRange,
  onDateRangeChange,
  onClearFilters,
}: ClienteProveedorMobileFiltersDrawerProps) {
  const hasActiveFilters =
    selectedTipo !== "todos" ||
    selectedEstado !== "todos" ||
    selectedBanco !== "todos" ||
    socioResponsableFilter.trim().length > 0 ||
    Boolean(selectedDateRange?.from || selectedDateRange?.to);

  const dateLabel = selectedDateRange?.from
    ? selectedDateRange.to
      ? `${format(selectedDateRange.from, "d/M/yy", { locale: es })} - ${format(
          selectedDateRange.to,
          "d/M/yy",
          { locale: es },
        )}`
      : format(selectedDateRange.from, "d/M/yy", { locale: es })
    : "Seleccionar fechas";

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
                onClick={onClearFilters}
              >
                Limpiar todo
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Filtros scrolleables */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          <FilterSelect
            label="Tipo"
            value={selectedTipo}
            onValueChange={onTipoChange}
            options={tipoClienteProovedorOptions}
          />
          <FilterSelect
            label="Estado"
            value={selectedEstado}
            onValueChange={onEstadoChange}
            options={estadosClienteProovedor}
          />
          <FilterSelect
            label="Banco"
            value={selectedBanco}
            onValueChange={onBancoChange}
            options={bancosOptions}
          />

          <div className="space-y-2">
            <Label
              htmlFor="mobile-socio-filter"
              className="text-xs font-medium text-muted-foreground"
            >
              Socio Responsable
            </Label>
            <Input
              id="mobile-socio-filter"
              placeholder="Buscar socio..."
              value={socioResponsableFilter}
              onChange={(e) => onSocioResponsableChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Fecha de Registro
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDateRange && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">{dateLabel}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={selectedDateRange?.from}
                  selected={selectedDateRange}
                  onSelect={onDateRangeChange}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Botón Aplicar — los filtros se aplican en vivo sobre el estado del servidor */}
        <div className="px-4 pb-6 pt-3 border-t shrink-0">
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Aplicar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
