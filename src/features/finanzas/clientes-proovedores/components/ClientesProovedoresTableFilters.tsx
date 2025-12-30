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
import { useClientesProovedoresTableFilters } from "../hooks/useClientesProovedoresTableFilters.hook";
import { FilterSelect } from "@/core/shared/components/DataTable/FilterSelect";
import {
  estadosClienteProovedor,
  tipoClienteProovedorOptions,
  bancosOptions,
} from "../types/ClientesProovedoresFiltersOptions";
import { FilterHeaderActions } from "@/core/shared/components/DataTable/FilterHeaderActions";

interface ClientesProovedoresTableFilters extends BaseFilterProps {
  table: Table<unknown>;
  onGlobalFilterChange?: (value: string) => void;
  onAdd?: () => void;
  onExport?: (table: Table<unknown>) => void;
}

export const ClientesProovedoresTableFilters = ({
  table,
  onGlobalFilterChange,
  addButtonIcon: AddButtonIcon,
  showAddButton,
  addButtonText = "Agregar",
  onAdd,
  onExport,
}: ClientesProovedoresTableFilters) => {
  const {
    clearFilters,
    handleEstadoChange,
    handleTipoChange,
    handleBancoChange,
    handleSocioResponsableChange,
    handleDateRangeChange,
    selectedEstado,
    selectedTipo,
    selectedBanco,
    socioResponsableFilter,
    selectedDateRange,
  } = useClientesProovedoresTableFilters(table);

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
              buttonTooltipText="Agregar Cliente/Proovedor"
              onClearFilters={() => {
                clearFilters();
                onGlobalFilterChange?.("");
              }}
              onAdd={onAdd}
              onExport={onExport}
              table={table}
              exportFileName="clientes-proveedores"
            />
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
                  placeholder="Buscar clientes/proveedores..."
                  value={
                    (table.getColumn("nombre")?.getFilterValue() ??
                      "") as string
                  }
                  onChange={(e) => {
                    table.getColumn("nombre")?.setFilterValue(e.target.value);
                    onGlobalFilterChange?.(e.target.value);
                  }}
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {/* Filtro de categoría */}

            <FilterSelect
              label="Tipo"
              onValueChange={handleTipoChange}
              options={tipoClienteProovedorOptions}
              value={selectedTipo}
            />
            <FilterSelect
              label="Estado"
              onValueChange={handleEstadoChange}
              options={estadosClienteProovedor}
              value={selectedEstado}
            />

            {/* Filtro de Banco */}
            <FilterSelect
              label="Banco"
              onValueChange={handleBancoChange}
              options={bancosOptions}
              value={selectedBanco}
            />

            {/* Filtro de Socio Responsable */}
            <div className="space-y-2 w-full min-w-0">
              <Label htmlFor="socio-filter" className="text-xs font-medium">
                Socio Responsable
              </Label>
              <Input
                id="socio-filter"
                placeholder="Buscar socio..."
                value={socioResponsableFilter}
                onChange={(e) => handleSocioResponsableChange(e.target.value)}
                className="w-full min-w-0"
              />
            </div>

            {/* Filtro de rango de fechas de registro */}
            <div className="space-y-2 w-full min-w-0">
              <Label htmlFor="date-range-filter" className="text-xs font-medium">
                Fecha de Registro
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
