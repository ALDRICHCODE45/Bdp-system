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
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/core/lib/utils";
import { BaseFilterProps } from "@/core/shared/components/DataTable/types";

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCategoria, setSelectedCategoria] = useState<string>("todos");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [montoRange, setMontoRange] = useState({ min: "", max: "" });

  const categoriasEgreso = [
    { value: "todos", label: "Todas las categorías" },
    { value: "Facturación", label: "Facturación" },
    { value: "Comisiones", label: "Comisiones" },
    { value: "Disposición", label: "Disposición" },
    { value: "Bancarizaciones", label: "Bancarizaciones" },
  ];

  const estadosEgreso = [
    { value: "todos", label: "Todos los estados" },
    { value: "Pagado", label: "Pagado" },
    { value: "Pendiente", label: "Pendiente" },
    { value: "Cancelado", label: "Cancelado" },
  ];

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (!range || (!range.from && !range.to)) {
      table.getColumn("fechaPago")?.setFilterValue(undefined);
      return;
    }
    table.getColumn("fechaPago")?.setFilterValue(range);
    table.setPageIndex(0);
  };

  const handleCategoriaChange = (categoria: string) => {
    setSelectedCategoria(categoria);
    if (categoria === "todos") {
      table.getColumn("categoria")?.setFilterValue(undefined);
    } else {
      table.getColumn("categoria")?.setFilterValue(categoria);
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

  const handleMontoFilter = () => {
    const min = montoRange.min ? parseFloat(montoRange.min) : undefined;
    const max = montoRange.max ? parseFloat(montoRange.max) : undefined;

    if (min !== undefined || max !== undefined) {
      table.getColumn("cantidad")?.setFilterValue({ min, max });
    } else {
      table.getColumn("cantidad")?.setFilterValue(undefined);
    }
    table.setPageIndex(0);
  };

  const clearFilters = () => {
    setDateRange(undefined);
    setSelectedCategoria("todos");
    setSelectedEstado("todos");
    setMontoRange({ min: "", max: "" });
    table.getColumn("fechaPago")?.setFilterValue(undefined);
    table.getColumn("categoria")?.setFilterValue(undefined);
    table.getColumn("estado")?.setFilterValue(undefined);
    table.getColumn("cantidad")?.setFilterValue(undefined);
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
        table.getColumn("fechaPago")?.setFilterValue(undefined);
      },
    },
    {
      condition: selectedCategoria !== "todos",
      label: `Categoría: ${
        categoriasEgreso.find((c) => c.value === selectedCategoria)?.label
      }`,
      clear: () => handleCategoriaChange("todos"),
    },
    {
      condition: selectedEstado !== "todos",
      label: `Estado: ${
        estadosEgreso.find((e) => e.value === selectedEstado)?.label
      }`,
      clear: () => handleEstadoChange("todos"),
    },
    {
      condition: montoRange.min !== "" || montoRange.max !== "",
      label: `Monto: ${montoRange.min || "0"} - ${montoRange.max || "∞"}`,
      clear: () => {
        setMontoRange({ min: "", max: "" });
        table.getColumn("cantidad")?.setFilterValue(undefined);
      },
    },
  ];

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
          {showAddButton && (
            <Button
              variant="default"
              size="sm"
              className="h-8 px-3 flex items-center gap-1"
            >
              {AddButtonIcon && <AddButtonIcon className="h-4 w-4" />}
              <span>{addButtonText}</span>
            </Button>
          )}
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
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          {/* Búsqueda global */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-xs font-medium">
              Búsqueda
            </Label>
            <div className="relative">
              <Input
                id="search"
                className="w-full pl-9"
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
          <div className="space-y-2">
            <Label htmlFor="categoria-filter" className="text-xs font-medium">
              Categoría
            </Label>
            <Select
              value={selectedCategoria}
              onValueChange={handleCategoriaChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categoriasEgreso.map((categoria) => (
                  <SelectItem key={categoria.value} value={categoria.value}>
                    {categoria.label}
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
                {estadosEgreso.map((estado) => (
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
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro de rango de monto */}
          <div className="space-y-2">
            <Label htmlFor="monto-filter" className="text-xs font-medium">
              Rango de Cantidad
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Mín"
                type="number"
                value={montoRange.min}
                onChange={(e) =>
                  setMontoRange((prev) => ({ ...prev, min: e.target.value }))
                }
                className="flex-1"
              />
              <Input
                placeholder="Máx"
                type="number"
                value={montoRange.max}
                onChange={(e) =>
                  setMontoRange((prev) => ({ ...prev, max: e.target.value }))
                }
                className="flex-1"
              />
              <Button size="sm" onClick={handleMontoFilter} className="px-3">
                <DollarSign className="h-4 w-4" />
              </Button>
            </div>
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
