import { jsPDF } from "jspdf";
import { FacturaDto } from "../server/dtos/FacturaDto.dto";
import { PDF_CONFIG } from "./pdf-config";
import {
  loadImageAsBase64,
  drawHeader,
  drawFooter,
  drawSection,
  drawField,
} from "./pdf-utils";

/**
 * Formatea un monto a formato de moneda mexicana
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};

/**
 * Formatea una fecha a formato corto legible
 */
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/**
 * Traduce el status a texto legible
 */
const getStatusLabel = (status: string): string => {
  const statuses: Record<string, string> = {
    borrador: "Borrador",
    enviada: "Enviada",
    pagada: "Pagada",
    cancelada: "Cancelada",
  };
  return statuses[status] || status;
};

/**
 * Exporta una factura individual a PDF con diseño profesional
 */
export const exportFacturaToPDF = async (
  factura: FacturaDto
): Promise<void> => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const { margins } = PDF_CONFIG;

    // Cargar logo
    let logoBase64: string | null = null;
    try {
      logoBase64 = await loadImageAsBase64(PDF_CONFIG.logo.path);
    } catch (error) {
      console.warn("No se pudo cargar el logo, continuando sin él:", error);
    }

    // Dibujar encabezado
    let yPosition = drawHeader(doc, logoBase64, pageWidth);

    // Título del documento
    doc.setFontSize(14);
    doc.setTextColor(PDF_CONFIG.colors.text);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURA", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 12;

    // Sección: Información General
    yPosition = drawSection(doc, "Información General", yPosition, pageWidth);
    drawField(
      doc,
      "UUID",
      factura.uuid,
      margins.left,
      yPosition,
      155
    );
    yPosition += 6;
    if (factura.serie || factura.folio) {
      drawField(
        doc,
        "Serie",
        factura.serie || "N/A",
        margins.left,
        yPosition,
        65
      );
      drawField(
        doc,
        "Folio",
        factura.folio || "N/A",
        pageWidth / 2,
        yPosition,
        65
      );
      yPosition += 6;
    }
    drawField(
      doc,
      "Status",
      getStatusLabel(factura.status),
      margins.left,
      yPosition,
      65
    );
    drawField(
      doc,
      "Moneda",
      factura.moneda,
      pageWidth / 2,
      yPosition,
      65
    );
    yPosition += 6;
    if (factura.metodoPago) {
      drawField(doc, "Método Pago", factura.metodoPago, margins.left, yPosition, 65);
      yPosition += 6;
    }
    if (factura.usoCfdi) {
      drawField(doc, "Uso CFDI", factura.usoCfdi, margins.left, yPosition, 65);
      yPosition += 6;
    }
    drawField(doc, "Concepto", factura.concepto, margins.left, yPosition, 155);
    yPosition += 12;

    // Sección: Montos
    yPosition = drawSection(doc, "Montos", yPosition, pageWidth);
    drawField(
      doc,
      "Subtotal",
      formatCurrency(factura.subtotal),
      margins.left,
      yPosition,
      65
    );
    drawField(
      doc,
      "Total",
      formatCurrency(factura.total),
      pageWidth / 2,
      yPosition,
      65
    );
    yPosition += 6;
    if (factura.totalImpuestosTransladados !== null) {
      drawField(
        doc,
        "Imp. Trasladados",
        formatCurrency(factura.totalImpuestosTransladados),
        margins.left,
        yPosition,
        65
      );
    }
    if (factura.totalImpuestosRetenidos !== null) {
      drawField(
        doc,
        "Imp. Retenidos",
        formatCurrency(factura.totalImpuestosRetenidos),
        pageWidth / 2,
        yPosition,
        65
      );
    }
    if (factura.totalImpuestosTransladados !== null || factura.totalImpuestosRetenidos !== null) {
      yPosition += 6;
    }
    yPosition += 6;

    // Sección: Información Fiscal
    yPosition = drawSection(doc, "Información Fiscal", yPosition, pageWidth);
    drawField(doc, "RFC Emisor", factura.rfcEmisor, margins.left, yPosition, 65);
    drawField(
      doc,
      "RFC Receptor",
      factura.rfcReceptor,
      pageWidth / 2,
      yPosition,
      65
    );
    yPosition += 6;
    if (factura.nombreEmisor) {
      drawField(doc, "Nombre Emisor", factura.nombreEmisor, margins.left, yPosition, 155);
      yPosition += 6;
    }
    if (factura.nombreReceptor) {
      drawField(doc, "Nombre Receptor", factura.nombreReceptor, margins.left, yPosition, 155);
      yPosition += 6;
    }
    yPosition += 6;

    // Sección: Fechas y Pago
    if (factura.fechaPago || factura.statusPago) {
      yPosition = drawSection(doc, "Pago", yPosition, pageWidth);
      if (factura.fechaPago) {
        drawField(doc, "Fecha Pago", formatDate(factura.fechaPago), margins.left, yPosition, 65);
      }
      if (factura.statusPago) {
        drawField(doc, "Status Pago", factura.statusPago, pageWidth / 2, yPosition, 65);
      }
      yPosition += 12;
    }

    // Dibujar pie de página
    drawFooter(doc, pageWidth, pageHeight);

    // Descargar PDF
    const fileName = `Factura_${factura.uuid.substring(0, 8)}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("Error al exportar factura a PDF:", error);
    throw new Error("No se pudo generar el PDF de la factura");
  }
};
