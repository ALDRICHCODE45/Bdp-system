import { BaseFilterProps } from "@/core/shared/components/DataTable/types";
import { Badge } from "@/core/shared/ui/badge";
import { Card, CardContent, CardHeader } from "@/core/shared/ui/card";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import { Table } from "@tanstack/react-table";
import { Filter, Search } from "lucide-react";
//import { FilterSelect } from "@/core/shared/components/DataTable/FilterSelect";
import { FilterHeaderActions } from "@/core/shared/components/DataTable/FilterHeaderActions";
import { useColaboradoresTableFilters } from "../hooks/useColaboradorTableFilters.hook";

interface ColaboradoresTableFilters extends BaseFilterProps {
  table: Table<unknown>;
  onGlobalFilterChange?: (value: string) => void;
  onAdd?: () => void;
}

export const ColaboradoresTableFilters = ({
  table,
  onGlobalFilterChange,
  addButtonIcon: AddButtonIcon,
  showAddButton,
  addButtonText = "Agregar",
  onAdd,
}: ColaboradoresTableFilters) => {
  const { clearFilters, handleEstadoChange: _handleEstadoChange, selectedEstado: _selectedEstado } =
    useColaboradoresTableFilters(table);

  return (
    <>
      <Card className="mb-6 border-0 shadow-md w-full min-w-0 overflow-hidden">
        <CardHeader className="pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Filter className="h-5 w-5 text-primary flex-shrink-0" />
            <Badge variant="outline" className="ml-2 flex-shrink-0">
              {table.getRowCount()} resultados
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto min-w-0">
            <FilterHeaderActions
              showAddButton={showAddButton}
              AddButtonIcon={AddButtonIcon}
              addButtonText={addButtonText}
              buttonTooltipText="Agregar Colaborador"
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
                Búsqueda
              </Label>
              <div className="relative w-full min-w-0">
                <Input
                  id="search"
                  className="w-full pl-9 min-w-0"
                  placeholder="Buscar colaborador..."
                  value={
                    (table.getColumn("name")?.getFilterValue() ?? "") as string
                  }
                  onChange={(e) => {
                    table.getColumn("name")?.setFilterValue(e.target.value);
                    onGlobalFilterChange?.(e.target.value);
                  }}
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {/* Filtro de categoría */}

            {/* <FilterSelect
              label="Estado"
              onValueChange={handleEstadoChange}
              options={estadosUser}
              value={selectedEstado}
            /> */}

            {/* Filtro de rango de fechas */}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
