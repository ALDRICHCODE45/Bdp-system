import { jsPDF } from "jspdf";
import { FacturaDto } from "../server/dtos/FacturaDto.dto";
import { PDF_CONFIG } from "./pdf-config";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  loadImageAsBase64,
  COLORS,
  FONT_SIZES as F,
  setInk,
  setMuted,
  hRule,
  sectionLabel,
} from "./pdf-utils";

// ─── Helpers locales ──────────────────────────────────────────────────────────

const formatCurrency = (amount: number, currency = "MXN"): string =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(amount);

const formatDate = (iso: string | null): string =>
  iso ? format(parseISO(iso), "d 'de' MMMM yyyy", { locale: es }) : "—";

const STATUS_LABELS: Record<string, string> = {
  borrador:  "Borrador",
  enviada:   "Enviada",
  pagada:    "Pagada",
  cancelada: "Cancelada",
};

// ─── Exportador principal ─────────────────────────────────────────────────────

export const exportFacturaToPDF = async (factura: FacturaDto): Promise<void> => {
  try {
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const PW = doc.internal.pageSize.getWidth();   // 210 mm
    const PH = doc.internal.pageSize.getHeight();  // 297 mm
    const { margins, logo } = PDF_CONFIG;

    const L   = margins.left;          // x izquierdo
    const R   = PW - margins.right;    // x derecho
    const CW  = R - L;                 // ancho de contenido
    const MID = L + CW / 2;           // punto medio

    const statusLabel = STATUS_LABELS[factura.status] ?? factura.status;

    // ── Cargar logo ───────────────────────────────────────────────────────────
    let logoBase64: string | null = null;
    try {
      logoBase64 = await loadImageAsBase64(logo.path);
    } catch {
      // continúa sin logo
    }

    // =========================================================================
    // CABECERA
    // =========================================================================
    let y = margins.top;

    // Logo
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", L, y, logo.width, logo.height);
    }

    // Nombre de empresa + subtítulo (junto al logo)
    const nameX = logoBase64 ? L + logo.width + 4 : L;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(F.company);
    setInk(doc);
    doc.text(PDF_CONFIG.systemName, nameX, y + logo.height * 0.45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(F.subtitle);
    setMuted(doc);
    doc.text(PDF_CONFIG.systemSubtitle, nameX, y + logo.height * 0.45 + 4.5);

    // Etiqueta "FACTURA" + fecha (lado derecho)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setInk(doc);
    doc.text("FACTURA", R, y + 5, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(F.subtitle);
    setMuted(doc);
    doc.text(
      format(new Date(), "d 'de' MMMM yyyy", { locale: es }),
      R,
      y + 10,
      { align: "right" }
    );

    y += logo.height + 5;
    hRule(doc, y, L, R, 0.3);

    // =========================================================================
    // HERO — Concepto + Monto Total
    // =========================================================================
    y += 6;

    // Pill de status (outline sin relleno, muy discreto)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(F.small);
    setMuted(doc);
    const pillText = statusLabel.toUpperCase();
    const pillW = doc.getTextWidth(pillText) + 7;
    doc.setDrawColor(...COLORS.rule);
    doc.setLineWidth(0.25);
    doc.roundedRect(L, y - 3.5, pillW, 5, 1.5, 1.5, "S");
    doc.text(pillText, L + 3.5, y, { baseline: "middle" } as Parameters<typeof doc.text>[3]);

    y += 7;

    // Concepto (título grande, izquierda — 55% del ancho)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    setInk(doc);
    const conceptoLines = doc.splitTextToSize(factura.concepto, CW * 0.55);
    doc.text(conceptoLines, L, y);
    const conceptoH = conceptoLines.length * 6.5;

    // Total (lado derecho) — "TOTAL" label alineado con el concepto
    doc.setFont("helvetica", "normal");
    doc.setFontSize(F.section);
    setMuted(doc);
    doc.text("TOTAL", R, y, { align: "right" });

    // Monto hero justo debajo del label, a 9pt de distancia
    const totalStr = formatCurrency(factura.total, factura.moneda ?? "MXN");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(F.hero);
    setInk(doc);
    doc.text(totalStr, R, y + 9, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(F.small);
    setMuted(doc);
    doc.text(factura.moneda ?? "MXN", R, y + 13.5, { align: "right" });

    // La altura del hero la domina el monto (al menos 22mm)
    y += Math.max(conceptoH, 22) + 5;
    hRule(doc, y, L, R);

    // =========================================================================
    // EMISOR / RECEPTOR
    // =========================================================================
    y += 6;
    sectionLabel(doc, "Emisor", L, y);
    sectionLabel(doc, "Receptor", MID, y);

    const fiscalStartY = y + 4;
    let yL = fiscalStartY;
    let yR = fiscalStartY;

    // Nombre emisor
    if (factura.nombreEmisor) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(F.value);
      setInk(doc);
      const emisorLines = doc.splitTextToSize(factura.nombreEmisor, CW / 2 - 5);
      doc.text(emisorLines, L, yL);
      yL += emisorLines.length * 5;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(F.small + 0.5);
    setMuted(doc);
    doc.text(`RFC: ${factura.rfcEmisor}`, L, yL + 1);
    yL += 5;

    // Nombre receptor
    if (factura.nombreReceptor) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(F.value);
      setInk(doc);
      const receptorLines = doc.splitTextToSize(factura.nombreReceptor, CW / 2 - 5);
      doc.text(receptorLines, MID, yR);
      yR += receptorLines.length * 5;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(F.small + 0.5);
    setMuted(doc);
    doc.text(`RFC: ${factura.rfcReceptor}`, MID, yR + 1);
    yR += 5;

    y = Math.max(yL, yR) + 5;
    hRule(doc, y, L, R);

    // =========================================================================
    // DETALLES (izquierda) + MONTOS (derecha)
    // =========================================================================
    y += 6;
    sectionLabel(doc, "Detalles", L, y);
    sectionLabel(doc, "Montos",   MID, y);

    const bodyStartY = y + 5;
    let yLeft  = bodyStartY;
    let yRight = bodyStartY;

    // ── Columna izquierda: detalles ──────────────────────────────────────────
    const drawDetailRow = (label: string, value: string | null | undefined) => {
      if (!value) return;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(F.small + 0.5);
      setMuted(doc);
      doc.text(label, L, yLeft);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(F.label);
      setInk(doc);
      doc.text(value, L + 30, yLeft);
      yLeft += 5.5;
    };

    drawDetailRow("Status",       statusLabel);
    if (factura.serie || factura.folio) {
      drawDetailRow(
        "Serie / Folio",
        [factura.serie, factura.folio].filter(Boolean).join(" / ")
      );
    }
    if (factura.metodoPago) drawDetailRow("Método de pago", factura.metodoPago);
    if (factura.usoCfdi)    drawDetailRow("Uso CFDI",       factura.usoCfdi);
    drawDetailRow("Moneda", factura.moneda ?? "MXN");

    // UUID (en gris muy pequeño, pegado sin gap extra)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(F.small - 0.5);
    setMuted(doc);
    const uuidLines = doc.splitTextToSize(`UUID: ${factura.uuid}`, CW / 2 - 4);
    doc.text(uuidLines, L, yLeft);
    const detallesEndY = yLeft + uuidLines.length * 3.5;

    // ── Columna derecha: montos ───────────────────────────────────────────────
    const drawAmountRow = (
      label: string,
      amount: number | null,
      bold = false
    ) => {
      if (amount === null) return;
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(bold ? F.value + 0.5 : F.label);
      if (bold) { setInk(doc); } else { setMuted(doc); }
      doc.text(label, MID, yRight);

      const amountStr = formatCurrency(amount, factura.moneda ?? "MXN");
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(bold ? F.value + 0.5 : F.label);
      doc.text(amountStr, R, yRight, { align: "right" });
      yRight += 5.5;
    };

    drawAmountRow("Subtotal", factura.subtotal);
    if (factura.totalImpuestosTransladados !== null)
      drawAmountRow("Imp. Trasladados", factura.totalImpuestosTransladados);
    if (factura.totalImpuestosRetenidos !== null)
      drawAmountRow("Imp. Retenidos",   factura.totalImpuestosRetenidos);

    // Línea fina antes del total
    yRight += 1;
    hRule(doc, yRight, MID, R, 0.3);
    yRight += 3;
    drawAmountRow("Total", factura.total, true);

    y = Math.max(detallesEndY, yRight) + 5;
    hRule(doc, y, L, R);

    // =========================================================================
    // PAGO (opcional) — siempre dos columnas: estado | fecha
    // =========================================================================
    if (factura.fechaPago || factura.statusPago) {
      y += 6;
      sectionLabel(doc, "Pago", L, y);
      y += 5;

      // Col izquierda: Estado de pago
      doc.setFont("helvetica", "normal");
      doc.setFontSize(F.small + 0.5);
      setMuted(doc);
      doc.text("Estado de pago", L, y);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(F.value);
      setInk(doc);
      doc.text(factura.statusPago ?? "—", L, y + 5);

      // Col derecha: Fecha de pago (siempre visible, muestra "—" si no hay)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(F.small + 0.5);
      setMuted(doc);
      doc.text("Fecha de pago", MID, y);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(F.value);
      setInk(doc);
      doc.text(formatDate(factura.fechaPago), MID, y + 5);

      y += 13;
    }

    // =========================================================================
    // FOOTER
    // =========================================================================
    const footerY = PH - margins.bottom;
    hRule(doc, footerY - 5, L, R, 0.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(F.small);
    setMuted(doc);
    doc.text(
      `Generado el ${format(new Date(), "d 'de' MMMM yyyy, HH:mm", { locale: es })}`,
      L,
      footerY
    );
    doc.text("Página 1 de 1", R, footerY, { align: "right" });

    // ── Guardar ───────────────────────────────────────────────────────────────
    const fileName = `Factura_${factura.uuid.substring(0, 8)}_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("Error al exportar factura a PDF:", error);
    throw new Error("No se pudo generar el PDF de la factura");
  }
};
