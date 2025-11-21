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
 * Traduce el estado a texto legible
 */
const getEstadoLabel = (estado: string): string => {
  const estados: Record<string, string> = {
    borrador: "Borrador",
    enviada: "Enviada",
    pagada: "Pagada",
    cancelada: "Cancelada",
  };
  return estados[estado] || estado;
};

/**
 * Traduce la forma de pago a texto legible
 */
const getFormaPagoLabel = (formaPago: string): string => {
  const formasPago: Record<string, string> = {
    transferencia: "Transferencia",
    efectivo: "Efectivo",
    cheque: "Cheque",
  };
  return formasPago[formaPago] || formaPago;
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
      "Núm. Factura",
      factura.numeroFactura,
      margins.left,
      yPosition,
      65
    );
    drawField(
      doc,
      "Monto",
      formatCurrency(factura.monto),
      pageWidth / 2,
      yPosition,
      65
    );
    yPosition += 6;
    drawField(
      doc,
      "Estado",
      getEstadoLabel(factura.estado),
      margins.left,
      yPosition,
      65
    );
    drawField(doc, "Periodo", factura.periodo, pageWidth / 2, yPosition, 65);
    yPosition += 6;
    drawField(
      doc,
      "Forma de Pago",
      getFormaPagoLabel(factura.formaPago),
      margins.left,
      yPosition,
      65
    );
    yPosition += 6;
    // Concepto y Folio Fiscal ocupan todo el ancho (sin campo al lado)
    drawField(doc, "Concepto", factura.concepto, margins.left, yPosition, 155);
    yPosition += 6;
    drawField(doc, "Folio Fiscal", factura.folioFiscal, margins.left, yPosition, 155);
    yPosition += 12;

    // Sección: Fechas
    yPosition = drawSection(doc, "Fechas", yPosition, pageWidth);
    drawField(
      doc,
      "F. Emisión",
      formatDate(factura.fechaEmision),
      margins.left,
      yPosition,
      65
    );
    drawField(
      doc,
      "F. Vencimiento",
      formatDate(factura.fechaVencimiento),
      pageWidth / 2,
      yPosition,
      65
    );
    yPosition += 6;
    drawField(
      doc,
      "F. Pago",
      formatDate(factura.fechaPago),
      margins.left,
      yPosition,
      65
    );
    drawField(
      doc,
      "F. Registro",
      formatDate(factura.fechaRegistro),
      pageWidth / 2,
      yPosition,
      65
    );
    yPosition += 12;

    // Sección: Cliente/Proveedor
    yPosition = drawSection(doc, "Cliente/Proveedor", yPosition, pageWidth);
    drawField(
      doc,
      "Nombre",
      factura.clienteProveedor,
      margins.left,
      yPosition,
      150
    );
    yPosition += 6;
    if (factura.clienteProveedorInfo) {
      drawField(
        doc,
        "RFC",
        factura.clienteProveedorInfo.rfc,
        margins.left,
        yPosition,
        65
      );
      drawField(
        doc,
        "Dirección",
        factura.clienteProveedorInfo.direccion,
        pageWidth / 2,
        yPosition,
        65
      );
      yPosition += 6;
    }
    yPosition += 10;

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
    drawField(
      doc,
      "Dir. Emisor",
      factura.direccionEmisor,
      margins.left,
      yPosition,
      150
    );
    yPosition += 6;
    drawField(
      doc,
      "Dir. Receptor",
      factura.direccionReceptor,
      margins.left,
      yPosition,
      150
    );
    yPosition += 12;

    // Verificar si hay espacio suficiente para la última sección (mínimo 30mm desde el footer)
    const minSpaceNeeded = 35;
    const availableSpace = pageHeight - margins.bottom - yPosition;
    
    if (availableSpace < minSpaceNeeded) {
      // No hay suficiente espacio, omitir sección adicional o agregar nota
      doc.setFontSize(PDF_CONFIG.fonts.small);
      doc.setTextColor(PDF_CONFIG.colors.secondary);
      doc.setFont("helvetica", "italic");
      doc.text(
        "Para más información contacte al emisor",
        margins.left,
        yPosition
      );
    } else {
      // Sección: Información Adicional
      yPosition = drawSection(doc, "Información Adicional", yPosition, pageWidth);
      drawField(
        doc,
        "Tipo",
        factura.tipoOrigen === "ingreso" ? "Ingreso" : "Egreso",
        margins.left,
        yPosition,
        65
      );
      yPosition += 6;
      drawField(doc, "Creado Por", factura.creadoPor, margins.left, yPosition, 65);
      drawField(
        doc,
        "Autorizado Por",
        factura.autorizadoPor,
        pageWidth / 2,
        yPosition,
        65
      );
      yPosition += 6;
      if (factura.notas) {
        drawField(doc, "Notas", factura.notas, margins.left, yPosition, 150);
        yPosition += 6;
      }
    }

    // Dibujar pie de página
    drawFooter(doc, pageWidth, pageHeight);

    // Descargar PDF
    const fileName = `Factura_${factura.numeroFactura}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("Error al exportar factura a PDF:", error);
    throw new Error("No se pudo generar el PDF de la factura");
  }
};

