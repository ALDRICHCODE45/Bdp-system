import { Table } from "@tanstack/react-table";
import { TableConfig } from "./types";
import { Label } from "@/core/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { Button } from "@/core/shared/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface DataTablePaginationProps<TData, TValue> {
  table: Table<TData>;
  config: TableConfig<TData>;
}

export const DataTablePagination = <TData, TValue>({
  config,
  table,
}: DataTablePaginationProps<TData, TValue>) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Información de paginación */}
        {config.pagination?.showPaginationInfo && (
          <div className="text-sm text-gray-400 text-center sm:text-left">
            Mostrando{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            a{" "}
            {Math.min(
              table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                table.getState().pagination.pageSize,
              table.getRowCount()
            )}{" "}
            de {table.getRowCount()} resultados
          </div>
        )}

        {/* Selector de tamaño de página */}
        {config.pagination?.showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <Label htmlFor="page-size" className="text-sm">
              Filas por página:
            </Label>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger id="page-size" className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(config.pagination.pageSizeOptions || [5, 10, 20, 50]).map(
                  (size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          buttonTooltip
          buttonTooltipText="Anterior"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        <span className="text-sm text-gray-400 whitespace-nowrap">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()}
        </span>

        <Button
          size="sm"
          variant="outline"
          buttonTooltip
          buttonTooltipText="Siguiente"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
