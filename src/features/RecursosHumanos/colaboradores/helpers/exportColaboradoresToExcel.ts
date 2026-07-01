import * as XLSX from "xlsx";
import type { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import {
  NIVEL_LABELS,
  MODALIDAD_LABELS,
  STATUS_LABELS,
} from "./colaboradorLabels";

/**
 * Export an array of colaboradores to Excel (.xlsx).
 *
 * Renders 9 spreadsheet columns: the 7 slim-table columns (cap1 req1) plus
 * Correo and Nivel so the file is self-contained for HR reporting:
 * Colaborador · Correo · Cargo · Nivel · Departamento · Jefe · FechaIngreso · Modalidad · Estado.
 *
 * Decoupled from `exportToExcel` (which walks a TanStack table) because the
 * colaboradores table is server-side paginated; we receive DTOs directly.
 */

const HEADERS = [
  "Colaborador",
  "Correo",
  "Cargo",
  "Nivel",
  "Departamento",
  "Jefe",
  "Fecha de Ingreso",
  "Modalidad",
  "Estado",
];

function formatFecha(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "";
  }
}

function rowFor(colaborador: ColaboradorDto): (string | number)[] {
  return [
    colaborador.name,
    colaborador.correo,
    colaborador.puesto,
    colaborador.nivel ? (NIVEL_LABELS[colaborador.nivel] ?? colaborador.nivel) : "",
    colaborador.departamento ?? "",
    colaborador.socio?.nombre ?? "Sin socio asignado",
    formatFecha(colaborador.fechaIngreso),
    colaborador.modalidad
      ? (MODALIDAD_LABELS[colaborador.modalidad] ?? colaborador.modalidad)
      : "",
    STATUS_LABELS[colaborador.status] ?? colaborador.status,
  ];
}

export function exportColaboradoresToExcel(
  colaboradores: ColaboradorDto[],
  fileName = "colaboradores",
): void {
  const data = colaboradores.map(rowFor);
  const worksheet = XLSX.utils.aoa_to_sheet([HEADERS, ...data]);

  // Reasonable widths for the 9 spreadsheet columns (in characters).
  worksheet["!cols"] = [
    { wch: 28 }, // Colaborador
    { wch: 30 }, // Correo
    { wch: 22 }, // Cargo
    { wch: 12 }, // Nivel
    { wch: 18 }, // Departamento
    { wch: 22 }, // Jefe
    { wch: 14 }, // FechaIngreso
    { wch: 12 }, // Modalidad
    { wch: 12 }, // Estado
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Colaboradores");

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}