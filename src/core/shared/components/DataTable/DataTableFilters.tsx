import { Table } from "@tanstack/react-table";
import { TableConfig } from "./types";
import { Input } from "@/core/shared/ui/input";
import { useId, useRef } from "react";
import { Download, ListFilterIcon, RefreshCw } from "lucide-react";
import { Button } from "@/core/shared/ui/button";
import { Table as TanstackTable } from "@tanstack/react-table";

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
                  className="w-full pl-9 min-w-0"
                  value={
                    (table
                      .getColumn(config.filters.searchColumn || "nombre")
                      ?.getFilterValue() ?? "") as string
                  }
                  onChange={(e) =>
                    table
                      .getColumn(config.filters?.searchColumn || "nombre")
                      ?.setFilterValue(e.target.value)
                  }
                  placeholder={config.filters.searchPlaceholder}
                  type="text"
                />
                <ListFilterIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto min-w-0">
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
              {config.actions?.showExportButton && config.actions?.onExport && (
                <Button
                  variant="outline"
                  className="w-full sm:w-auto min-w-0"
                  onClick={() =>
                    config.actions?.onExport?.(table as Table<unknown>)
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
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
