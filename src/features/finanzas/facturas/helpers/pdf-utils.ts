import { jsPDF } from "jspdf";

/**
 * Carga una imagen desde una ruta pública y la convierte a base64 para jsPDF.
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

// ─── Paleta de colores ────────────────────────────────────────────────────────
export const COLORS = {
  ink:   [17,  17,  17]  as [number, number, number], // texto principal
  muted: [140, 140, 140] as [number, number, number], // labels / secundario
  rule:  [220, 220, 220] as [number, number, number], // líneas separadoras
} as const;

// ─── Tamaños de fuente (pt) ───────────────────────────────────────────────────
export const FONT_SIZES = {
  company:  13,
  subtitle:  7,
  hero:     21,   // monto total hero
  section:   7,   // labels de sección (uppercase)
  label:     7.5, // etiquetas de campo
  value:     8.5, // valores de campo
  small:     6.5, // footer / UUID
} as const;

// ─── Utilidades de dibujo ─────────────────────────────────────────────────────

/** Aplica color de texto principal */
export const setInk = (doc: jsPDF) =>
  doc.setTextColor(...COLORS.ink);

/** Aplica color de texto secundario */
export const setMuted = (doc: jsPDF) =>
  doc.setTextColor(...COLORS.muted);

/**
 * Dibuja una línea horizontal separadora.
 * @param weight - Grosor en mm (default 0.2)
 */
export const hRule = (
  doc: jsPDF,
  y: number,
  x1: number,
  x2: number,
  weight = 0.2
) => {
  doc.setDrawColor(...COLORS.rule);
  doc.setLineWidth(weight);
  doc.line(x1, y, x2, y);
};

/**
 * Dibuja una etiqueta de sección en mayúsculas (estilo editorial).
 */
export const sectionLabel = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number
) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(FONT_SIZES.section);
  doc.setTextColor(...COLORS.muted);
  doc.text(text.toUpperCase(), x, y);
};
