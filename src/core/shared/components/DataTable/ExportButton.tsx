"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/core/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/shared/ui/dropdown-menu";
import { Download, FileSpreadsheet } from "lucide-react";
import { exportToExcel } from "@/core/shared/helpers/exportToExcel";

interface ExportButtonProps<TData> {
  table: Table<TData>;
  onExport?: (table: Table<TData>) => void;
  fileName?: string;
}

export function ExportButton<TData>({
  table,
  onExport,
  fileName,
}: ExportButtonProps<TData>) {
  const handleExportXLSX = () => {
    if (onExport) {
      // Si hay una función personalizada, ejecutarla pasando la tabla
      onExport(table);
    } else {
      // Si no, usar la función genérica
      exportToExcel(table, fileName);
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
        <DropdownMenuItem onClick={handleExportXLSX}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar como XLSX
        </DropdownMenuItem>
        {/* Placeholder para PDF - se implementará en el futuro */}
        <DropdownMenuItem disabled>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar como PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

