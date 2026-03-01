import * as XLSX from "xlsx";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import type { FacturaDto } from "../server/dtos/FacturaDto.dto";

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  pagada: "Pagada",
  cancelada: "Cancelada",
};

function formatDate(val: string | null | undefined): string {
  if (!val) return "";
  try {
    const d = parseISO(val);
    return isValid(d) ? format(d, "dd/MM/yyyy", { locale: es }) : val;
  } catch {
    return val;
  }
}

function formatNum(val: number | null | undefined): number | string {
  if (val === null || val === undefined) return "";
  return val;
}

// ── Exportador ─────────────────────────────────────────────────────────────────

/**
 * Genera y descarga un Excel con TODOS los campos del DTO de factura.
 * No depende de la instancia de TanStack Table — trabaja directamente con los datos.
 *
 * @param facturas - Array de FacturaDto (ya procesados por el mapper)
 * @param filenamePrefix - Prefijo del nombre del archivo (sin extensión ni fecha)
 */
export function exportFacturasToExcel(
  facturas: FacturaDto[],
  filenamePrefix = "facturas"
): void {
  // ── Headers (en español, en el mismo orden que las columnas de exportación) ──
  const headers = [
    "UUID",
    "Concepto",
    "Serie",
    "Folio",
    "Status",
    "RFC Emisor",
    "Nombre Emisor",
    "RFC Receptor",
    "Nombre Receptor",
    "Uso CFDI",
    "Método de Pago",
    "Moneda",
    "Subtotal",
    "Imp. Trasladados",
    "Imp. Retenidos",
    "Total",
    "Status de Pago",
    "Fecha de Pago",
    "Ingresado Por",
    "Fecha de Registro",
    "Última Actualización",
  ];

  // ── Filas ──────────────────────────────────────────────────────────────────
  const rows = facturas.map((f) => [
    f.uuid ?? "",
    f.concepto ?? "",
    f.serie ?? "",
    f.folio ?? "",
    STATUS_LABELS[f.status] ?? f.status,
    f.rfcEmisor ?? "",
    f.nombreEmisor ?? "",
    f.rfcReceptor ?? "",
    f.nombreReceptor ?? "",
    f.usoCfdi ?? "",
    f.metodoPago ?? "",
    f.moneda ?? "",
    formatNum(f.subtotal),
    formatNum(f.totalImpuestosTransladados),
    formatNum(f.totalImpuestosRetenidos),
    formatNum(f.total),
    f.statusPago ?? "",
    formatDate(f.fechaPago),
    f.ingresadoPorNombre ?? "",
    formatDate(f.createdAt),
    formatDate(f.updatedAt),
  ]);

  // ── Worksheet ──────────────────────────────────────────────────────────────
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Anchos de columna (en orden, mismo que headers)
  const colWidths = [36, 40, 6, 8, 12, 16, 35, 16, 35, 8, 16, 6, 14, 16, 16, 14, 14, 14, 25, 20, 20];
  worksheet["!cols"] = colWidths.map((wch) => ({ wch }));

  // ── Workbook ───────────────────────────────────────────────────────────────
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Facturas");

  const dateStr = format(new Date(), "yyyyMMdd_HHmm");
  XLSX.writeFile(workbook, `${filenamePrefix}_${dateStr}.xlsx`);
}
