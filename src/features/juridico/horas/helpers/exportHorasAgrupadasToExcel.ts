import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { ReporteGrupoDto } from "../server/dtos/ReporteHorasAgrupadoDto.dto";

const ESTADO_LABELS: Record<string, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  CERRADO: "Cerrado",
};

/**
 * Genera y descarga un Excel con TODOS los grupos del reporte (DTO-array,
 * no la página actual). Mismo patrón que exportFacturasToExcel.
 */
export function exportHorasAgrupadasToExcel(
  grupos: ReporteGrupoDto[],
  filenamePrefix = "reporte-horas-agrupado",
): void {
  const headers = [
    "Periodo",
    "Año",
    "Semana",
    "Abogado",
    "Cliente",
    "Asunto",
    "Equipo",
    "Socio",
    "Estado",
    "Horas",
  ];

  const rows = grupos.map((g) => [
    `Sem ${g.semana} · ${g.ano}`,
    g.ano,
    g.semana,
    g.usuarioNombre,
    g.clienteNombre,
    g.asuntoNombre,
    g.equipoNombre,
    g.socioNombre,
    ESTADO_LABELS[g.estadoAsunto] ?? g.estadoAsunto,
    g.horas,
  ]);

  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  const colWidths = [16, 8, 8, 24, 22, 26, 18, 18, 12, 10];
  worksheet["!cols"] = colWidths.map((wch) => ({ wch }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Horas");

  const dateStr = format(new Date(), "yyyyMMdd_HHmm");
  XLSX.writeFile(workbook, `${filenamePrefix}_${dateStr}.xlsx`);
}
