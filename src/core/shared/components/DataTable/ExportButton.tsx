"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/core/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/shared/ui/dropdown-menu";
import { Download, FileSpreadsheet, Filter, CheckSquare } from "lucide-react";
import { exportToExcel } from "@/core/shared/helpers/exportToExcel";

export type ExportOptions = { selectedOnly?: boolean; filteredOnly?: boolean };

interface ExportButtonProps<TData> {
  table: Table<TData>;
  onExport?: (table: Table<TData>, options?: ExportOptions) => void;
  fileName?: string;
  enableSelectedRowsExport?: boolean;
  enableFilteredRowsExport?: boolean;
  /**
   * Activar cuando la tabla está en modo server-side.
   * Oculta la opción "Exportar filas filtradas" (su conteo es incorrecto
   * en server-side porque getFilteredRowModel solo tiene la página actual).
   */
  isServerSide?: boolean;
}

export function ExportButton<TData>({
  table,
  onExport,
  fileName,
  enableSelectedRowsExport = true,
  enableFilteredRowsExport = true,
  isServerSide = false,
}: ExportButtonProps<TData>) {
  const selectedRowsCount = table.getSelectedRowModel().rows.length;
  const filteredRowsCount = table.getFilteredRowModel().rows.length;
  const totalRowsCount = table.getRowCount();
  const hasSelectedRows = selectedRowsCount > 0;
  // En server-side, getFilteredRowModel solo tiene la página actual,
  // por lo que hasFilters siempre sería true (10 < 1000). Lo desactivamos.
  const hasFilters = !isServerSide && filteredRowsCount < totalRowsCount;

  const handleExportXLSX = (options?: {
    selectedOnly?: boolean;
    filteredOnly?: boolean;
  }) => {
    if (onExport) {
      // Si hay una función personalizada, ejecutarla pasando la tabla y opciones
      onExport(table, options);
    } else {
      // Si no, usar la función genérica
      if (options?.selectedOnly && hasSelectedRows) {
        // Exportar solo filas seleccionadas
        const selectedTable = {
          ...table,
          getRowModel: () => ({
            rows: table.getSelectedRowModel().rows,
          }),
        } as Table<TData>;
        exportToExcel(
          selectedTable,
          fileName ? `${fileName}_seleccionadas` : "datos_seleccionados"
        );
      } else if (options?.filteredOnly && hasFilters) {
        // Exportar solo filas filtradas
        exportToExcel(
          table,
          fileName ? `${fileName}_filtradas` : "datos_filtrados"
        );
      } else {
        // Exportar todas las filas
        exportToExcel(table, fileName);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-3">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExportXLSX()}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar todas las filas ({totalRowsCount})
        </DropdownMenuItem>

        {enableFilteredRowsExport && hasFilters && (
          <DropdownMenuItem
            onClick={() => handleExportXLSX({ filteredOnly: true })}
          >
            <Filter className="h-4 w-4 mr-2" />
            Exportar filas filtradas ({filteredRowsCount})
          </DropdownMenuItem>
        )}

        {enableSelectedRowsExport && hasSelectedRows && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleExportXLSX({ selectedOnly: true })}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Exportar filas seleccionadas ({selectedRowsCount})
            </DropdownMenuItem>
          </>
        )}

        {/* Placeholder para PDF - se implementará en el futuro */}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar como PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
