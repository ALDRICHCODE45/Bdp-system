import { BaseFilterProps } from "@/core/shared/components/DataTable/types";
import { Badge } from "@/core/shared/ui/badge";
import { Card, CardContent, CardHeader } from "@/core/shared/ui/card";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import { Button } from "@/core/shared/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/shared/ui/popover";
import { Calendar } from "@/core/shared/ui/calendar";
import { Table } from "@tanstack/react-table";
import { Filter, Search, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/core/lib/utils";
import { FilterSelect } from "@/core/shared/components/DataTable/FilterSelect";
import { FilterHeaderActions } from "@/core/shared/components/DataTable/FilterHeaderActions";
import { useAsistenciasTableFilters } from "../../hooks/useAsistenciasTableFilters.hook";

const tipoAsistenciaOptions = [
  { value: "todos", label: "Todos los Tipos" },
  { value: "Entrada", label: "Entrada" },
  { value: "Salida", label: "Salida" },
];

interface AsistenciasTableFilters extends BaseFilterProps {
  table: Table<unknown>;
  onGlobalFilterChange?: (value: string) => void;
  onAdd?: () => void;
}

export const AsistenciasTableFilters = ({
  table,
  onGlobalFilterChange,
  addButtonIcon: AddButtonIcon,
  showAddButton,
  addButtonText = "Agregar",
  onAdd,
}: AsistenciasTableFilters) => {
  const {
    clearFilters,
    handleTipoChange,
    handleDateRangeChange,
    handleNombreColaboradorChange,
    selectedTipo,
    selectedDateRange,
    nombreColaboradorFilter,
  } = useAsistenciasTableFilters(table);

  return (
    <>
      <Card className="mb-6 border-0 shadow-md w-full min-w-0 overflow-hidden">
        <CardHeader className="pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Filter className="h-5 w-5 text-primary flex-shrink-0" />
            <Badge variant="outline" className="ml-2 flex-shrink-0">
              {table.getFilteredRowModel().rows.length} resultados
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto min-w-0">
            <FilterHeaderActions
              showAddButton={showAddButton}
              AddButtonIcon={AddButtonIcon}
              addButtonText={addButtonText}
              buttonTooltipText="Agregar Asistencia"
              onClearFilters={() => {
                clearFilters();
                onGlobalFilterChange?.("");
              }}
              onAdd={onAdd}
            />
          </div>
        </CardHeader>

        <CardContent className="pt-4 pb-3 px-4 sm:px-6 w-full min-w-0">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 w-full min-w-0">
            {/* Búsqueda global */}
            <div className="space-y-2 w-full min-w-0">
              <Label htmlFor="search" className="text-xs font-medium">
                Búsqueda por Correo
              </Label>
              <div className="relative w-full min-w-0">
                <Input
                  id="search"
                  className="w-full pl-9 min-w-0"
                  placeholder="Buscar por correo..."
                  value={
                    (table.getColumn("correo")?.getFilterValue() ??
                      "") as string
                  }
                  onChange={(e) => {
                    table.getColumn("correo")?.setFilterValue(e.target.value);
                    onGlobalFilterChange?.(e.target.value);
                  }}
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {/* Filtro de Tipo */}
            <FilterSelect
              label="Tipo"
              onValueChange={handleTipoChange}
              options={tipoAsistenciaOptions}
              value={selectedTipo}
            />

            {/* Filtro de Nombre Colaborador */}
            <div className="space-y-2 w-full min-w-0">
              <Label htmlFor="nombre-filter" className="text-xs font-medium">
                Nombre Colaborador
              </Label>
              <Input
                id="nombre-filter"
                placeholder="Buscar colaborador..."
                value={nombreColaboradorFilter}
                onChange={(e) => handleNombreColaboradorChange(e.target.value)}
                className="w-full min-w-0"
              />
            </div>

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
          </div>
        </CardContent>
      </Card>
    </>
  );
};
