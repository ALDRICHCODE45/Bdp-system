import { BaseFilterProps } from "@/core/shared/components/DataTable/types";
import { Badge } from "@/core/shared/ui/badge";
import { Card, CardContent, CardHeader } from "@/core/shared/ui/card";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import { Table } from "@tanstack/react-table";
import { Filter, Search } from "lucide-react";
import { FacturasFilterActions } from "./FacturasFilterActions";
import { useFacturasTableFilters } from "../hooks/useFacturasTableFilters.hook";
import { FilterSelect } from "@/core/shared/components/FilterSelect";
import {
  filterEstadoOptions,
  filterMetodoPagoOptions,
  filterTipoOptions,
} from "../types/filterOptions/FilterOptions.type";

interface FacturasFiltersProps extends BaseFilterProps {
  table: Table<unknown>;
  onGlobalFilerChange?: (value: string) => void;
}

export const FacturasTableFilters = ({
  table,
  onGlobalFilerChange,
  addButtonIcon,
  addButtonText = "Agregar",
  showAddButton = false,
}: FacturasFiltersProps) => {
  const {
    clearFilters,
    handleEstadoChange,
    handleMetodoPagoChange,
    handleTipoChange,
    selectedEstado,
    selectedMetodoPago,
    selectedTipo,
  } = useFacturasTableFilters(table);

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
          <FacturasFilterActions
            showAddButton={showAddButton}
            AddButtonIcon={addButtonIcon}
            addButtonText={addButtonText}
            onClearFilters={() => {
              clearFilters();
              onGlobalFilerChange?.("");
            }}
          />
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
                  onGlobalFilerChange?.(e.target.value);
                }}
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Filtro de estado */}
          <FilterSelect
            label="Estado"
            onValueChange={handleEstadoChange}
            options={filterEstadoOptions}
            value={selectedEstado}
          />

          {/* Filtro de método de pago */}
          <FilterSelect
            label="Metodo de Pago"
            onValueChange={handleMetodoPagoChange}
            options={filterMetodoPagoOptions}
            value={selectedMetodoPago}
          />

          {/* Filtro de tipo*/}
          <FilterSelect
            label="Tipo"
            onValueChange={handleTipoChange}
            options={filterTipoOptions}
            value={selectedTipo}
          />
        </div>
      </CardContent>
    </Card>
  );
};
