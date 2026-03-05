import * as XLSX from "xlsx";
import { ALL_EXCEL_COLUMNS } from "../server/validators/importFacturaExcelRowSchema";
import { format } from "date-fns";

/**
 * Genera y descarga una plantilla Excel con las columnas requeridas
 * y un ejemplo de datos.
 */
export function generateExcelTemplate(): void {
  // Headers
  const headers = [...ALL_EXCEL_COLUMNS];

  // Ejemplo de datos
  // El orden debe coincidir exactamente con ALL_EXCEL_COLUMNS:
  // REQUIRED: UUID, Concepto, Subtotal, Total, RFC Emisor, RFC Receptor
  // OPTIONAL:  Serie, Folio, Status, IVA Monto, Impuestos Trasladados, Impuestos Retenidos,
  //            Método Pago, Moneda, Uso CFDI, Nombre Emisor, Nombre Receptor,
  //            Status Pago, Fecha Emisión, Fecha Pago, Factura URL
  const exampleRow = [
    "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX", // UUID
    "Servicios de consultoria",              // Concepto
    10000.00,                                // Subtotal
    11600.00,                                // Total
    "XAXX010101000",                         // RFC Emisor
    "XAXX010101000",                         // RFC Receptor
    "A",                                     // Serie (opcional)
    "001",                                   // Folio (opcional)
    "VIGENTE",                               // Status (opcional)
    1600.00,                                 // IVA Monto (opcional)
    1600.00,                                 // Impuestos Trasladados (opcional)
    0.00,                                    // Impuestos Retenidos (opcional)
    "PUE",                                   // Método Pago (opcional)
    "MXN",                                   // Moneda (opcional)
    "G03",                                   // Uso CFDI (opcional)
    "Empresa Emisora S.A.",                  // Nombre Emisor (opcional)
    "Empresa Receptora S.A.",                // Nombre Receptor (opcional)
    "Pagado",                                // Status Pago (opcional)
    "2026-01-15",                            // Fecha Emisión (opcional, formato YYYY-MM-DD)
    "2026-02-01",                            // Fecha Pago (opcional, formato YYYY-MM-DD)
    "https://ejemplo.com/factura.pdf",       // Factura URL (opcional)
  ];

  // Crear datos de la hoja
  const worksheetData = [headers, exampleRow];

  // Crear worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Ajustar ancho de columnas
  const columnWidths = headers.map((header) => ({
    wch: Math.max(header.length, 15),
  }));
  worksheet["!cols"] = columnWidths;

  // Crear hoja de instrucciones
  const instructionsData = [
    ["INSTRUCCIONES PARA IMPORTAR FACTURAS"],
    [""],
    ["Columnas Obligatorias:"],
    ["- UUID: UUID fiscal del CFDI (debe ser único)"],
    ["- Concepto: Descripción del servicio o producto"],
    ["- Subtotal: Monto antes de impuestos"],
    ["- Total: Monto total de la factura"],
    ["- RFC Emisor: RFC del emisor (12-13 caracteres)"],
    ["- RFC Receptor: RFC del receptor (12-13 caracteres)"],
    [""],
    ["Columnas Opcionales:"],
    ["- Serie: Serie del comprobante"],
    ["- Folio: Folio del comprobante"],
    ["- Status: Estado de la factura — VIGENTE o CANCELADA (por defecto VIGENTE)"],
    ["- IVA Monto: Monto del IVA aplicado a la factura"],
    ["- Impuestos Trasladados: Total de impuestos trasladados (IVA cobrado)"],
    ["- Impuestos Retenidos: Total de impuestos retenidos"],
    ["- Método Pago: PUE o PPD"],
    ["- Moneda: MXN, USD, etc. (por defecto MXN)"],
    ["- Uso CFDI: Clave de uso del CFDI (G03, P01, etc.)"],
    ["- Nombre Emisor: Nombre o razón social del emisor"],
    ["- Nombre Receptor: Nombre o razón social del receptor"],
    ["- Status Pago: Pagado o Pendiente de pago"],
    ["- Fecha Emisión: Fecha de timbrado/emisión del CFDI (formato YYYY-MM-DD)"],
    ["- Fecha Pago: Fecha en que se realizó el pago (formato YYYY-MM-DD)"],
    ["- Factura URL: URL del PDF de la factura timbrada (SAT)"],
    [""],
    ["NOTAS IMPORTANTES:"],
    ["1. Si el UUID ya existe, se mostrará como duplicado y podrás elegir si actualizarlo"],
    ["2. Las facturas nuevas sin Status se crean como VIGENTE"],
    ["3. Las fechas deben estar en formato YYYY-MM-DD (ej: 2026-01-15)"],
    [""],
    ["Tamaño máximo del archivo: 10MB"],
  ];

  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
  instructionsSheet["!cols"] = [{ wch: 80 }];

  // Crear workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Facturas");
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instrucciones");

  // Generar nombre de archivo
  const fileName = `plantilla_importar_facturas_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

  // Descargar archivo
  XLSX.writeFile(workbook, fileName);
}
