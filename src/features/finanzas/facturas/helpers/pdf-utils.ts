import { jsPDF } from "jspdf";
import { PDF_CONFIG } from "./pdf-config";

/**
 * Convierte una imagen a base64 para ser usada en jsPDF
 */
export const loadImageAsBase64 = async (imagePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = imagePath;
  });
};

/**
 * Dibuja el encabezado del PDF con logo y nombre del sistema
 */
export const drawHeader = (
  doc: jsPDF,
  logoBase64: string | null,
  pageWidth: number
) => {
  const { margins, logo, fonts, colors, systemName } = PDF_CONFIG;

  // Fondo del encabezado más compacto
  doc.setFillColor(colors.lightGray);
  doc.rect(0, 0, pageWidth, 35, "F");

  // Logo en la esquina superior derecha
  if (logoBase64) {
    try {
      doc.addImage(
        logoBase64,
        "PNG",
        pageWidth - margins.right - logo.width,
        margins.top - 5,
        logo.width,
        logo.height
      );
    } catch (error) {
      console.error("Error al cargar logo:", error);
    }
  }

  // Nombre del sistema a la izquierda
  doc.setFontSize(fonts.title);
  doc.setTextColor(colors.primary);
  doc.setFont("helvetica", "bold");
  doc.text(systemName, margins.left, margins.top + 5);

  return 45; // Retorna la posición Y donde termina el encabezado (más compacto)
};

/**
 * Dibuja el pie de página con información de generación
 */
export const drawFooter = (
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number
) => {
  const { margins, fonts, colors } = PDF_CONFIG;
  const footerY = pageHeight - margins.bottom;

  // Línea divisoria
  doc.setDrawColor(colors.border);
  doc.line(margins.left, footerY - 5, pageWidth - margins.right, footerY - 5);

  // Texto del pie de página
  doc.setFontSize(fonts.small);
  doc.setTextColor(colors.secondary);
  doc.setFont("helvetica", "italic");

  const timestamp = new Date().toLocaleString("es-MX");
  doc.text(`Documento generado el ${timestamp}`, margins.left, footerY);

  // Número de página
  doc.text(`Página 1 de 1`, pageWidth - margins.right, footerY, {
    align: "right",
  });
};

/**
 * Dibuja una sección con título
 */
export const drawSection = (
  doc: jsPDF,
  title: string,
  yPosition: number,
  pageWidth: number
): number => {
  const { margins, fonts, colors } = PDF_CONFIG;

  doc.setFillColor(colors.primary);
  doc.rect(
    margins.left,
    yPosition,
    pageWidth - margins.left - margins.right,
    8,
    "F"
  );

  doc.setFontSize(fonts.sectionHeader);
  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.text(title, margins.left + 5, yPosition + 6);

  return yPosition + 15; // Retorna nueva posición Y
};

/**
 * Dibuja un campo de información (label: value)
 * Maneja valores largos truncándolos si es necesario
 */
export const drawField = (
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  maxWidth: number = 70
): void => {
  const { fonts, colors } = PDF_CONFIG;

  doc.setFontSize(fonts.normal);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colors.text);
  doc.text(`${label}:`, x, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(colors.secondary);
  
  // Truncar el valor si es muy largo
  const displayValue = value || "N/A";
  const textWidth = doc.getTextWidth(displayValue);
  
  if (textWidth > maxWidth) {
    // Truncar y añadir elipsis
    let truncated = displayValue;
    while (doc.getTextWidth(truncated + "...") > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    doc.text(truncated + "...", x + 45, y);
  } else {
    doc.text(displayValue, x + 45, y);
  }
};

