import { Table } from "@tanstack/react-table";
import { TableConfig } from "./types";
import { Input } from "@/core/shared/ui/input";
import { useId, useRef, useState, useEffect } from "react";
import { ListFilterIcon, RefreshCw, X, Trash2, FileDown } from "lucide-react";
import { Button } from "@/core/shared/ui/button";
import { Table as TanstackTable } from "@tanstack/react-table";
import { useDebounce } from "@/core/shared/hooks/use-debounce";
import { Badge } from "@/core/shared/ui/badge";
import { ExportButton } from "./ExportButton";

interface DataTableFiltersProps<TData> {
  config: TableConfig<TData>;
  table: Table<TData>;
  setGlobalFilter: (value: string) => void;
}

export function DataTableFilters<TData>({
  config,
  table,
  setGlobalFilter,
}: DataTableFiltersProps<TData>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  // Estado local para el valor del input (sin debounce)
  const searchColumn = config.filters?.searchColumn || "nombre";
  const currentFilterValue = (table.getColumn(searchColumn)?.getFilterValue() ??
    "") as string;
  const [searchValue, setSearchValue] = useState<string>(currentFilterValue);

  // Debounce del valor de búsqueda (300ms por defecto)
  const debouncedSearchValue = useDebounce(searchValue, 300);

  // Actualizar el filtro de la tabla cuando el valor debounceado cambia
  useEffect(() => {
    const column = table.getColumn(searchColumn);
    if (column) {
      column.setFilterValue(debouncedSearchValue);
    }
  }, [debouncedSearchValue, searchColumn, table]);

  // Sincronizar el estado local cuando el filtro externo cambia
  useEffect(() => {
    const filterValue = (table.getColumn(searchColumn)?.getFilterValue() ??
      "") as string;
    if (filterValue !== searchValue) {
      setSearchValue(filterValue);
    }
  }, [currentFilterValue, searchColumn]);

  // Función para limpiar la búsqueda
  const handleClearSearch = () => {
    setSearchValue("");
    table.getColumn(searchColumn)?.setFilterValue("");
  };

  // Componente de filtros personalizado
  const CustomFilterComponent = config.filters?.customFilter?.component;
  const customFilterProps = config.filters?.customFilter?.props || {};

  // Componente de acciones personalizado
  const CustomActionComponent =
    config.actions?.customActionComponent?.component;
  const customActionProps = config.actions?.customActionComponent?.props || {};

  return (
    <>
      {CustomFilterComponent ? (
        <CustomFilterComponent
          table={table as TanstackTable<unknown>}
          onGlobalFilterChange={setGlobalFilter}
          onExport={config.actions?.onExport}
          {...customFilterProps}
        />
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full min-w-0">
          <div className="flex items-center gap-3 w-full sm:w-auto min-w-0 flex-1">
            {/* Search input */}
            {config.filters?.showSearch && (
              <div className="relative flex-1 max-w-md min-w-0">
                <Input
                  id={`${id}-input`}
                  ref={inputRef}
                  className="w-full pl-9 pr-9 min-w-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={config.filters.searchPlaceholder}
                  type="text"
                  aria-label="Buscar en la tabla"
                  aria-describedby={`${id}-search-description`}
                />
                <span id={`${id}-search-description`} className="sr-only">
                  Buscar en todas las columnas de la tabla
                </span>
                <ListFilterIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                {searchValue && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 hover:bg-transparent"
                    onClick={handleClearSearch}
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Acciones personalizadas o por defecto */}
          {CustomActionComponent ? (
            <div className="w-full sm:w-auto min-w-0 flex-shrink-0">
              <CustomActionComponent
                table={table as TanstackTable<unknown>}
                onAdd={config.actions?.onAdd}
                onExport={config.actions?.onExport}
                onRefresh={config.actions?.onRefresh}
                customActions={config.actions?.customActions}
                {...customActionProps}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto min-w-0 flex-wrap">
              {/* Contador y acciones bulk para filas seleccionadas */}
              {config.enableRowSelection &&
                config.actions?.showBulkActions &&
                table.getSelectedRowModel().rows.length > 0 && (
                  <div className="flex items-center gap-2 mr-2">
                    <Badge variant="secondary" className="mr-1">
                      {table.getSelectedRowModel().rows.length} seleccionada
                      {table.getSelectedRowModel().rows.length !== 1 ? "s" : ""}
                    </Badge>
                    {config.actions.onBulkExport && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const selectedRows = table
                            .getSelectedRowModel()
                            .rows.map((row) => row.original);
                          config.actions?.onBulkExport?.(selectedRows);
                        }}
                        aria-label="Exportar filas seleccionadas"
                      >
                        <FileDown className="h-4 w-4 mr-1" />
                        Exportar
                      </Button>
                    )}
                    {config.actions.onBulkDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const selectedRows = table
                            .getSelectedRowModel()
                            .rows.map((row) => row.original);
                          config.actions?.onBulkDelete?.(selectedRows);
                        }}
                        aria-label="Eliminar filas seleccionadas"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                )}

              {/* Botón de agregar */}
              {config.actions?.showAddButton && (
                <Button
                  variant="default"
                  size={"icon"}
                  onClick={config.actions.onAdd}
                  buttonTooltip
                  buttonTooltipText={config.actions.addButtonText}
                >
                  {config.actions.addButtonIcon}
                </Button>
              )}

              {/* Botón de exportar */}
              {config.actions?.showExportButton && (
                <ExportButton
                  table={table as Table<unknown>}
                  onExport={config.actions?.onExport}
                  fileName={config.actions?.exportFileName}
                  enableSelectedRowsExport={config.enableRowSelection}
                  enableFilteredRowsExport={true}
                />
              )}

              {/* Botón de actualizar */}
              {config.actions?.showRefreshButton && (
                <Button
                  variant="outline"
                  className="w-full sm:w-auto min-w-0"
                  onClick={config.actions.onRefresh}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              )}

              {/* Acciones personalizadas */}
              {config.actions?.customActions}
            </div>
          )}
        </div>
      )}
    </>
  );
}
