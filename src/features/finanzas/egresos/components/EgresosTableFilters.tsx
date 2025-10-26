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
import {
  Filter,
  Search,
  Calendar as CalendarIcon,
  RefreshCw,
  Download,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/core/lib/utils";
import { BaseFilterProps } from "@/core/shared/components/DataTable/types";
import { useEgresosTableFilters } from "../hooks/useEgresosTableFilters";
import { FilterSelect } from "@/core/shared/components/DataTable/FilterSelect";
import {
  categoriasEgresoOptions,
  estadosEgresosOptions,
} from "../types/EgresosFilterOptions";

interface EgresosFiltersProps extends BaseFilterProps {
  table: Table<unknown>;
  onGlobalFilterChange?: (value: string) => void;
}

export function EgresosFilters({
  table,
  onGlobalFilterChange,
  showAddButton = false,
  addButtonText = "Agregar",
  addButtonIcon: AddButtonIcon,
}: EgresosFiltersProps) {
  const {
    clearFilters,
    handleCategoriaChange,
    handleDateRangeChange,
    handleEstadoChange,
    handleMontoFilter,
    selectedCategoria,
    selectedDateRange,
    selectedEstado,
    selectedMontoRange,
    setMontoRange,
  } = useEgresosTableFilters(table);

  return (
    <Card className="mb-6 border-0 shadow-md w-full min-w-0 overflow-hidden">
      <CardHeader className="pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Filter className="h-5 w-5 text-primary flex-shrink-0" />
          <Badge variant="outline" className="ml-2 flex-shrink-0">
            {table.getFilteredRowModel().rows.length} resultados
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto min-w-0">
          {showAddButton && (
            <Button
              variant="default"
              size="sm"
              className="h-8 px-3 flex items-center gap-1 flex-shrink-0"
            >
              {AddButtonIcon && <AddButtonIcon className="h-4 w-4" />}
              <span className="hidden sm:inline">{addButtonText}</span>
              <span className="sm:hidden">+</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-3 flex items-center gap-1 flex-shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Limpiar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 flex-shrink-0"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Exportar</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-3 px-4 sm:px-6 w-full min-w-0">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 w-full min-w-0">
          {/* Búsqueda global */}
          <div className="space-y-2 w-full min-w-0">
            <Label htmlFor="search" className="text-xs font-medium">
              Búsqueda
            </Label>
            <div className="relative w-full min-w-0">
              <Input
                id="search"
                className="w-full pl-9 min-w-0"
                placeholder="Buscar egresos..."
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

          {/* Filtro de categoría */}

          <FilterSelect
            label="Categoria"
            onValueChange={handleCategoriaChange}
            options={categoriasEgresoOptions}
            value={selectedCategoria}
          />
          <FilterSelect
            label="Estado"
            onValueChange={handleEstadoChange}
            options={estadosEgresosOptions}
            value={selectedEstado}
          />

          {/* Filtro de rango de fechas */}
          <div className="space-y-2 w-full min-w-0">
            <Label htmlFor="date-range-filter" className="text-xs font-medium">
              Rango de Fechas
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal min-w-0",
                    !selectedDateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {selectedDateRange?.from ? (
                      selectedDateRange.to ? (
                        <>
                          {format(selectedDateRange.from, "d/M/yy", {
                            locale: es,
                          })}{" "}
                          -{" "}
                          {format(selectedDateRange.to, "d/M/yy", {
                            locale: es,
                          })}
                        </>
                      ) : (
                        format(selectedDateRange.from, "d/M/yy", { locale: es })
                      )
                    ) : (
                      "Seleccionar fechas"
                    )}
                  </span>
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

          {/* Filtro de rango de monto */}
          <div className="space-y-2 w-full min-w-0">
            <Label htmlFor="monto-filter" className="text-xs font-medium">
              Rango de Cantidad
            </Label>
            <div className="flex gap-2 w-full min-w-0">
              <Input
                placeholder="Mín"
                type="number"
                value={selectedMontoRange.min}
                onChange={(e) =>
                  setMontoRange((prev) => ({ ...prev, min: e.target.value }))
                }
                className="flex-1 min-w-0"
              />
              <Input
                placeholder="Máx"
                type="number"
                value={selectedMontoRange.max}
                onChange={(e) =>
                  setMontoRange((prev) => ({ ...prev, max: e.target.value }))
                }
                className="flex-1 min-w-0"
              />
              <Button
                size="sm"
                onClick={handleMontoFilter}
                className="px-3 flex-shrink-0"
              >
                <DollarSign className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
