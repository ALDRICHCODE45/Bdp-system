import * as XLSX from "xlsx";
import { Table } from "@tanstack/react-table";

/**
 * Exporta los datos filtrados de una tabla a formato Excel (XLSX)
 * @param table - Instancia de la tabla de TanStack Table
 * @param fileName - Nombre del archivo (sin extensión). Si no se proporciona, se usa "export_{fecha}"
 */
export function exportToExcel<TData>(
  table: Table<TData>,
  fileName?: string
): void {
  // Obtener columnas visibles (excluyendo columnas de acciones)
  const visibleColumns = table.getVisibleLeafColumns().filter((column) => {
    // Excluir columnas de acciones
    if (column.id === "actions") return false;
    // Solo incluir columnas con accessorKey o accessorFn definido
    const def = column.columnDef as {
      accessorKey?: string;
      accessorFn?: unknown;
    };
    return !!(def.accessorKey || def.accessorFn);
  });

  // Extraer headers de las columnas
  const headers = visibleColumns.map((column) => {
    // Obtener el header: puede ser string o función que retorna ReactNode
    const header = column.columnDef.header;
    const def = column.columnDef as { accessorKey?: string };
    if (typeof header === "string") {
      return header;
    }
    if (typeof header === "function") {
      // Si es función, intentar obtener un valor legible
      // Por defecto, usar el id de la columna o el accessorKey
      return column.id || def.accessorKey || "";
    }
    // Si es ReactNode, usar el id o accessorKey como fallback
    return column.id || def.accessorKey || "";
  });

  // Obtener datos filtrados
  const filteredRows = table.getFilteredRowModel().rows;

  // Mapear datos a formato plano
  const data = filteredRows.map((row) => {
    return visibleColumns.map((column) => {
      const value = row.getValue(column.id);

      // Manejar valores null/undefined
      if (value === null || value === undefined) {
        return "";
      }

      // Si es un objeto, intentar extraer un valor útil
      if (typeof value === "object" && value !== null) {
        // Si tiene una propiedad común como 'nombre', 'label', 'value', usarla
        if ("nombre" in value && typeof value.nombre === "string") {
          return value.nombre;
        }
        if ("label" in value && typeof value.label === "string") {
          return value.label;
        }
        if ("value" in value) {
          return String(value.value);
        }
        // Si no, convertir a string
        return JSON.stringify(value);
      }

      // Si es una fecha (string ISO), formatearla
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString("es-MX");
          }
        } catch {
          // Si falla el parseo, devolver el string original
        }
      }

      // Para números, mantener el formato
      if (typeof value === "number") {
        return value;
      }

      // Para el resto, convertir a string
      return String(value);
    });
  });

  // Crear worksheet con headers y datos
  const worksheetData = [headers, ...data];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Ajustar ancho de columnas
  const columnWidths = visibleColumns.map(() => ({ wch: 15 }));
  worksheet["!cols"] = columnWidths;

  // Crear workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

  // Generar nombre de archivo
  const defaultFileName = `export_${new Date().toISOString().split("T")[0]}`;
  const finalFileName = fileName || defaultFileName;
  const fileNameWithExtension = `${finalFileName}.xlsx`;

  // Descargar archivo
  XLSX.writeFile(workbook, fileNameWithExtension);
}
