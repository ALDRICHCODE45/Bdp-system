import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  loadImageAsBase64,
  FONT_SIZES as F,
  setInk,
  setMuted,
  hRule,
  sectionLabel,
} from "@/features/finanzas/facturas/helpers/pdf-utils";
import { PDF_CONFIG } from "@/features/finanzas/facturas/helpers/pdf-config";
import { formatHoras } from "./formatHoras";
import type {
  ReporteAgrupadoFilters,
  SubtotalesDto,
} from "../server/dtos/ReporteHorasAgrupadoDto.dto";

const ESTADO_LABELS: Record<string, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  CERRADO: "Cerrado",
};

// ─── Etiquetas legibles para los filtros (id → nombre) ─────────────────────

export interface ReportePdfFilterLabels {
  usuarioId?: Record<string, string>;
  asuntoJuridicoId?: Record<string, string>;
  clienteProveedorId?: Record<string, string>;
  equipoJuridicoId?: Record<string, string>;
  socioId?: Record<string, string>;
}

// ─── Filtrar etiquetas legibles para mostrar en el PDF ──────────────────────

type FilterEntry = { label: string; value: string };

function filtersToReadable(
  filters: ReporteAgrupadoFilters,
  labels?: ReportePdfFilterLabels,
): FilterEntry[] {
  const idToName = (id: string, map?: Record<string, string>): string =>
    map?.[id] ?? id;

  const out: FilterEntry[] = [];
  if (filters.usuarioId)
    out.push({
      label: "Abogado",
      value: idToName(filters.usuarioId, labels?.usuarioId),
    });
  if (filters.asuntoJuridicoId)
    out.push({
      label: "Asunto",
      value: idToName(filters.asuntoJuridicoId, labels?.asuntoJuridicoId),
    });
  if (filters.clienteProveedorId)
    out.push({
      label: "Cliente",
      value: idToName(filters.clienteProveedorId, labels?.clienteProveedorId),
    });
  if (filters.equipoJuridicoId)
    out.push({
      label: "Equipo",
      value: idToName(filters.equipoJuridicoId, labels?.equipoJuridicoId),
    });
  if (filters.socioId)
    out.push({
      label: "Socio",
      value: idToName(filters.socioId, labels?.socioId),
    });
  if (filters.estado)
    out.push({
      label: "Estado asunto",
      value: ESTADO_LABELS[filters.estado] ?? filters.estado,
    });
  if (filters.horasDesde !== undefined || filters.horasHasta !== undefined) {
    const min = filters.horasDesde ?? 0;
    const max = filters.horasHasta ?? "∞";
    out.push({ label: "Horas", value: `${min} – ${max}` });
  }
  if (filters.ano !== undefined)
    out.push({ label: "Año", value: String(filters.ano) });
  if (filters.semanaDesde !== undefined || filters.semanaHasta !== undefined) {
    const min = filters.semanaDesde ?? 1;
    const max = filters.semanaHasta ?? 53;
    out.push({ label: "Semana ISO", value: `${min} – ${max}` });
  }
  return out;
}

// ─── Tabla de breakdown reusable ─────────────────────────────────────────────

interface BreakdownRow {
  nombre: string;
  horas: number;
  grupos: number;
}

function drawBreakdownTable(
  doc: jsPDF,
  startY: number,
  L: number,
  R: number,
  title: string,
  rows: BreakdownRow[],
): number {
  let y = startY;
  sectionLabel(doc, title, L, y);
  y += 5;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(F.section);
  setMuted(doc);
  doc.text("Nombre", L, y);
  doc.text("Horas", R - 35, y, { align: "right" });
  doc.text("Grupos", R, y, { align: "right" });
  y += 1.5;
  hRule(doc, y, L, R, 0.3);
  y += 4;

  // Rows
  if (rows.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(F.small);
    setMuted(doc);
    doc.text("Sin datos para esta dimensión.", L, y);
    return y + 6;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(F.label);
  setInk(doc);

  const sorted = [...rows].sort((a, b) => b.horas - a.horas);

  for (const row of sorted) {
    if (y > 270) break; // simple overflow guard
    const nameLines = doc.splitTextToSize(row.nombre, R - L - 60);
    doc.text(nameLines, L, y);
    doc.text(formatHoras(row.horas), R - 35, y, { align: "right" });
    doc.text(row.grupos.toLocaleString("es-MX"), R, y, { align: "right" });
    y += Math.max(nameLines.length * 4, 5);
  }

  return y + 4;
}

// ─── Exportador principal ────────────────────────────────────────────────────

export const exportHorasResumenToPDF = async (
  filters: ReporteAgrupadoFilters,
  subtotales: SubtotalesDto,
  labels?: ReportePdfFilterLabels,
): Promise<void> => {
  try {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const PW = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();
    const { margins, logo } = PDF_CONFIG;

    const L = margins.left;
    const R = PW - margins.right;

    // ── Header ────────────────────────────────────────────────────────────
    let y = margins.top;

    let logoBase64: string | null = null;
    try {
      logoBase64 = await loadImageAsBase64(logo.path);
    } catch {
      // continúa sin logo
    }

    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", L, y, logo.width, logo.height);
    }

    const nameX = logoBase64 ? L + logo.width + 4 : L;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(F.company);
    setInk(doc);
    doc.text(PDF_CONFIG.systemName, nameX, y + logo.height * 0.45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(F.subtitle);
    setMuted(doc);
    doc.text(PDF_CONFIG.systemSubtitle, nameX, y + logo.height * 0.45 + 4.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setInk(doc);
    doc.text("RESUMEN HORAS", R, y + 5, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(F.subtitle);
    setMuted(doc);
    doc.text(
      format(new Date(), "d 'de' MMMM yyyy", { locale: es }),
      R,
      y + 10,
      { align: "right" },
    );

    y += logo.height + 5;
    hRule(doc, y, L, R, 0.3);

    // ── Title ─────────────────────────────────────────────────────────────
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    setInk(doc);
    doc.text("Reporte Agrupado de Horas Jurídicas", L, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(F.label);
    setMuted(doc);
    doc.text(
      `Generado el ${format(new Date(), "d 'de' MMMM yyyy, HH:mm", { locale: es })}`,
      L,
      y + 2,
    );
    y += 7;
    hRule(doc, y, L, R, 0.2);

    // ── Criterios aplicados ───────────────────────────────────────────────
    y += 6;
    sectionLabel(doc, "Criterios aplicados", L, y);
    y += 5;

    const criteria = filtersToReadable(filters, labels);
    if (criteria.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(F.label);
      setMuted(doc);
      doc.text("Sin filtros — todos los registros.", L, y);
      y += 5;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(F.label);
      setInk(doc);
      for (const c of criteria) {
        if (y > PH - 30) break;
        doc.setFont("helvetica", "normal");
        setMuted(doc);
        doc.text(`${c.label}:`, L, y);
        doc.setFont("helvetica", "bold");
        setInk(doc);
        doc.text(c.value, L + 35, y);
        y += 5;
      }
    }

    y += 4;
    hRule(doc, y, L, R, 0.2);

    // ── Totales ───────────────────────────────────────────────────────────
    y += 6;
    sectionLabel(doc, "Totales", L, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setInk(doc);
    doc.text("Horas totales", L, y);
    doc.text(formatHoras(subtotales.totalHoras), R, y, { align: "right" });
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(F.label);
    setInk(doc);
    doc.text("Grupos totales", L, y);
    doc.text(subtotales.totalGrupos.toLocaleString("es-MX"), R, y, {
      align: "right",
    });

    y += 6;
    hRule(doc, y, L, R, 0.2);

    // ── Breakdowns ────────────────────────────────────────────────────────
    y += 8;
    y = drawBreakdownTable(
      doc,
      y,
      L,
      R,
      "Por abogado",
      subtotales.porAbogado.map((r) => ({
        nombre: r.nombre,
        horas: r.horas,
        grupos: r.grupos,
      })),
    );

    hRule(doc, y, L, R, 0.1);
    y += 6;

    y = drawBreakdownTable(
      doc,
      y,
      L,
      R,
      "Por cliente",
      subtotales.porCliente.map((r) => ({
        nombre: r.nombre,
        horas: r.horas,
        grupos: r.grupos,
      })),
    );

    hRule(doc, y, L, R, 0.1);
    y += 6;

    y = drawBreakdownTable(
      doc,
      y,
      L,
      R,
      "Por asunto",
      subtotales.porAsunto.map((r) => ({
        nombre: r.nombre,
        horas: r.horas,
        grupos: r.grupos,
      })),
    );

    // ── Footer ────────────────────────────────────────────────────────────
    const footerY = PH - margins.bottom;
    hRule(doc, footerY - 5, L, R, 0.2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(F.small);
    setMuted(doc);
    doc.text(
      `${PDF_CONFIG.systemName} — Reporte generado automáticamente`,
      L,
      footerY,
    );
    doc.text("Página 1 de 1", R, footerY, { align: "right" });

    const fileName = `Resumen_Horas_Agrupadas_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("Error al exportar resumen a PDF:", error);
    throw new Error("No se pudo generar el PDF de resumen de horas");
  }
};
