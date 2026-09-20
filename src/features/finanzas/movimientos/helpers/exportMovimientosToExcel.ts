import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { MovimientoListItemDto } from "../server/dtos/MovimientoListDto.dto";

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Formatea fechas en UTC.
 *
 * Los campos de fecha de Movimiento son date-only guardados a medianoche UTC;
 * formatear en hora local (MX, UTC-6) mostraría el día anterior. La tabla usa
 * el mismo criterio (`timeZone: "UTC"`) para no desfasar el día.
 */
const UTC_DATE_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(val: string | null | undefined): string {
  if (!val) return "";
  const date = new Date(val);
  if (Number.isNaN(date.getTime())) return val;
  return UTC_DATE_FORMATTER.format(date);
}

/** Decimal serializado como string en el DTO → número en la planilla. */
function formatMonto(val: string | null | undefined): number | string {
  if (val === null || val === undefined || val === "") return "";
  const parsed = Number(val);
  return Number.isNaN(parsed) ? val : parsed;
}

// ── Exportador ─────────────────────────────────────────────────────────────────

/**
 * Genera y descarga un Excel con los campos del DTO de movimiento.
 * No depende de la instancia de TanStack Table — trabaja directamente con los
 * datos que devuelve el server action de exportación.
 *
 * @param movimientos - Array de MovimientoListItemDto
 * @param filenamePrefix - Prefijo del nombre del archivo (sin extensión ni fecha)
 */
export function exportMovimientosToExcel(
  movimientos: MovimientoListItemDto[],
  filenamePrefix = "movimientos",
): void {
  // ── Headers (en español, mismo orden que las filas) ─────────────────────────
  const headers = [
    "Tipo",
    "Titular",
    "Estado Cuenta",
    "Fecha Corte",
    "Fecha Operación",
    "Descripción",
    "Monto (MXN)",
    "Estado",
    "Concepto",
    "Categoría",
    "Forma de Pago",
    "Cargo/Abono",
    "Facturado Por",
    "Periodo",
    "No. Factura",
    "Folio Fiscal",
    "Proveedor",
    "Cliente",
    "Solicitante",
    "Autorizador",
    "Ingresado Por",
    "Fecha de Registro",
    "Última Actualización",
  ];

  // ── Filas ──────────────────────────────────────────────────────────────────
  const rows = movimientos.map((m) => [
    m.tipo ?? "",
    m.titular ?? "",
    m.estadoCuenta ?? "",
    formatDate(m.fechaCorte),
    formatDate(m.fechaOperacion),
    m.descripcionLiteral ?? "",
    formatMonto(m.monto),
    m.estado ?? "",
    m.concepto ?? "",
    m.categoria ?? "",
    m.formaPago ?? "",
    m.cargoAbono ?? "",
    m.facturadoPor ?? "",
    m.periodo ?? "",
    m.numeroFactura ?? "",
    m.folioFiscal ?? "",
    m.proveedorNombre ?? m.proveedor ?? "",
    m.clienteNombre ?? m.cliente ?? "",
    m.solicitanteNombre ?? "",
    m.autorizadorNombre ?? "",
    m.ingresadoPorNombre ?? "",
    formatDate(m.createdAt),
    formatDate(m.updatedAt),
  ]);

  // ── Worksheet ──────────────────────────────────────────────────────────────
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Anchos de columna (mismo orden que headers)
  const colWidths = [
    10, 24, 22, 14, 16, 45, 16, 12, 32, 16, 14, 14, 14, 10, 16, 16, 28, 28, 24,
    24, 22, 18, 18,
  ];
  worksheet["!cols"] = colWidths.map((wch) => ({ wch }));

  // ── Workbook ───────────────────────────────────────────────────────────────
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Movimientos");

  const dateStr = format(new Date(), "yyyyMMdd_HHmm");
  XLSX.writeFile(workbook, `${filenamePrefix}_${dateStr}.xlsx`);
}
