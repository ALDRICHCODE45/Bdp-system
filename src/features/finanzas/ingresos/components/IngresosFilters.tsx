"use client";
import { Table } from "@tanstack/react-table";
import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/shared/ui/popover";
import { Calendar } from "@/core/shared/ui/calendar";
import { Badge } from "@/core/shared/ui/badge";
import { Card, CardContent, CardHeader } from "@/core/shared/ui/card";
import { Filter, Search, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/core/lib/utils";
import { useIngresosTableFilters } from "../hooks/useIngresosTableFilters";
import { FilterSelect } from "@/core/shared/components/DataTable/FilterSelect";
import {
  estadosIngresoOptions,
  formaPagoOptions,
} from "../types/filterOptions.type";
import { BaseFilterProps } from "@/core/shared/components/DataTable/types";
import { FilterHeaderActions } from "@/core/shared/components/DataTable/FilterHeaderActions";

interface IngresosFiltersProps extends BaseFilterProps {
  table: Table<unknown>;
  onGlobalFilterChange?: (value: string) => void;
}

export function IngresosFilters({
  table,
  onGlobalFilterChange,
  addButtonIcon,
  addButtonText = "Agregar",
  showAddButton,
}: IngresosFiltersProps) {
  const {
    clearFilters,
    handleDateRangeChange,
    handleEstadoChange,
    handleFormaPagoChange,
    selectedDateRange,
    selectedEstado,
    selectedTipo,
  } = useIngresosTableFilters(table);

  return (
    <Card className="mb-6 border-0 shadow-md">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="ml-2">
            {table.getFilteredRowModel().rows.length} resultados
          </Badge>
        </div>
        <div className="flex gap-2">
          <FilterHeaderActions
            showAddButton={showAddButton}
            AddButtonIcon={addButtonIcon}
            addButtonText={addButtonText}
            buttonTooltipText="Agregar Ingreso"
            onClearFilters={() => {
              clearFilters();
              onGlobalFilterChange?.("");
            }}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-3 px-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* Búsqueda global */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-xs font-medium">
              Búsqueda
            </Label>
            <div className="relative">
              <Input
                id="search"
                className="w-full pl-9"
                placeholder="Buscar ingresos..."
                value={
                  (table.getColumn("concepto")?.getFilterValue() ??
                    "") as string
                }
                onChange={(e) => {
                  table.getColumn("concepto")?.setFilterValue(e.target.value);
                  onGlobalFilterChange?.(e.target.value);
                }}
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Filtro de tipo */}
          <FilterSelect
            value={selectedTipo}
            label="Forma de Pago"
            onValueChange={handleFormaPagoChange}
            options={formaPagoOptions}
          />

          <FilterSelect
            value={selectedEstado}
            label="Estado"
            onValueChange={handleEstadoChange}
            options={estadosIngresoOptions}
          />

          {/* Filtro de rango de fechas */}
          <div className="space-y-2">
            <Label htmlFor="date-range-filter" className="text-xs font-medium">
              Rango de Fechas
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDateRange?.from ? (
                    selectedDateRange.to ? (
                      <>
                        {format(selectedDateRange.from, "d/M/yy", {
                          locale: es,
                        })}{" "}
                        -{" "}
                        {format(selectedDateRange.to, "d/M/yy", { locale: es })}
                      </>
                    ) : (
                      format(selectedDateRange.from, "d/M/yy", { locale: es })
                    )
                  ) : (
                    "Seleccionar fechas"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={selectedDateRange?.from}
                  selected={selectedDateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
