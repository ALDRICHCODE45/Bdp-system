"use client";
import { useState } from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
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
  X,
  RefreshCw,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/core/lib/utils";

interface IngresosFiltersProps {
  table: Table<unknown>;
  onGlobalFilterChange?: (value: string) => void;
}

export function IngresosFilters({
  table,
  onGlobalFilterChange,
}: IngresosFiltersProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedTipo, setSelectedTipo] = useState<string>("todos");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");

  const formaPagoOptions = [
    { value: "todos", label: "Todas las formas" },
    { value: "Transferencia", label: "Transferencia" },
    { value: "Efectivo", label: "Efectivo" },
    { value: "Cheque", label: "Cheque" },
  ];

  const estadosIngreso = [
    { value: "todos", label: "Todos los estados" },
    { value: "pendiente", label: "Pendiente" },
    { value: "pagado", label: "Pagado" },
    { value: "cancelado", label: "Cancelado" },
  ];

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (!range || (!range.from && !range.to)) {
      table.getColumn("fecha")?.setFilterValue(undefined);
      return;
    }
    table.getColumn("fecha")?.setFilterValue(range);
    table.setPageIndex(0);
  };

  const handleTipoChange = (tipo: string) => {
    setSelectedTipo(tipo);
    if (tipo === "todos") {
      table.getColumn("formaPago")?.setFilterValue(undefined);
    } else {
      table.getColumn("formaPago")?.setFilterValue(tipo);
    }
    table.setPageIndex(0);
  };

  const handleEstadoChange = (estado: string) => {
    setSelectedEstado(estado);
    if (estado === "todos") {
      table.getColumn("estado")?.setFilterValue(undefined);
    } else {
      table.getColumn("estado")?.setFilterValue(estado);
    }
    table.setPageIndex(0);
  };

  const clearFilters = () => {
    setDateRange(undefined);
    setSelectedTipo("todos");
    setSelectedEstado("todos");
    table.getColumn("fecha")?.setFilterValue(undefined);
    table.getColumn("tipo")?.setFilterValue(undefined);
    table.getColumn("estado")?.setFilterValue(undefined);
    onGlobalFilterChange?.("");
  };

  const activeFilters = [
    {
      condition: dateRange && (dateRange.from || dateRange.to),
      label: `Fecha: ${
        dateRange?.from ? format(dateRange.from, "d/M/yy", { locale: es }) : ""
      } - ${
        dateRange?.to ? format(dateRange.to, "d/M/yy", { locale: es }) : "ahora"
      }`,
      clear: () => {
        setDateRange(undefined);
        table.getColumn("fecha")?.setFilterValue(undefined);
      },
    },
    {
      condition: selectedTipo !== "todos",
      label: `Tipo: ${
        formaPagoOptions.find((t) => t.value === selectedTipo)?.label
      }`,
      clear: () => handleTipoChange("todos"),
    },
    {
      condition: selectedEstado !== "todos",
      label: `Estado: ${
        estadosIngreso.find((e) => e.value === selectedEstado)?.label
      }`,
      clear: () => handleEstadoChange("todos"),
    },
  ];

  return (
    <Card className="mb-6 border-0 shadow-md">
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Filtros de Ingresos</h3>
          <Badge variant="outline" className="ml-2">
            {table.getFilteredRowModel().rows.length} resultados
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-3 flex items-center gap-1"
          >
            <RefreshCw />
            <span>Limpiar</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-3">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
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
          <div className="space-y-2">
            <Label htmlFor="tipo-filter" className="text-xs font-medium">
              Forma de Pago
            </Label>
            <Select value={selectedTipo} onValueChange={handleTipoChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {formaPagoOptions.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de estado */}
          <div className="space-y-2">
            <Label htmlFor="estado-filter" className="text-xs font-medium">
              Estado
            </Label>
            <Select value={selectedEstado} onValueChange={handleEstadoChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {estadosIngreso.map((estado) => (
                  <SelectItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "d/M/yy", { locale: es })} -{" "}
                        {format(dateRange.to, "d/M/yy", { locale: es })}
                      </>
                    ) : (
                      format(dateRange.from, "d/M/yy", { locale: es })
                    )
                  ) : (
                    "Seleccionar fechas"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Indicadores de filtros activos */}
        <div className="flex flex-wrap gap-2 mt-4">
          {activeFilters.map((filter, index) =>
            filter.condition ? (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {filter.label}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={filter.clear}
                />
              </Badge>
            ) : null
          )}
        </div>
      </CardContent>
    </Card>
  );
}
