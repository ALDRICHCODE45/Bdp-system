import * as XLSX from "xlsx";
import { ALL_EXCEL_COLUMNS } from "../server/validators/importFacturaExcelRowSchema";

/**
 * Genera y descarga una plantilla Excel con las columnas requeridas
 * y un ejemplo de datos.
 */
export function generateExcelTemplate(): void {
  // Headers
  const headers = [...ALL_EXCEL_COLUMNS];

  // Ejemplo de datos
  const exampleRow = [
    "FAC-001", // Numero de Factura
    "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX", // Folio Fiscal
    "Empresa Ejemplo S.A. de C.V.", // Cliente/Proveedor
    "XAXX010101000", // RFC Cliente
    "Servicios de consultoria", // Concepto
    "10000.00", // Monto
    "2024-01", // Periodo
    "2024-01-15", // Fecha Emision
    "2024-02-15", // Fecha Vencimiento
    "TRANSFERENCIA", // Forma de Pago
    "XAXX010101000", // RFC Emisor
    "XAXX010101000", // RFC Receptor
    "Av. Principal #123, Col. Centro", // Direccion Emisor (opcional)
    "Calle Secundaria #456, Col. Norte", // Direccion Receptor (opcional)
    "1234567890", // Numero Cuenta (opcional)
    "012345678901234567", // CLABE (opcional)
    "Banco Ejemplo", // Banco (opcional)
    "Notas adicionales", // Notas (opcional)
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
    ["- Numero de Factura: Identificador unico de la factura"],
    ["- Folio Fiscal: UUID del folio fiscal (debe ser unico)"],
    ["- Cliente/Proveedor: Nombre del cliente o proveedor"],
    ["- RFC Cliente: RFC del cliente (12-13 caracteres)"],
    ["- Concepto: Descripcion del servicio o producto"],
    ["- Monto: Cantidad numerica positiva"],
    ["- Periodo: Formato YYYY-MM (ej: 2024-01)"],
    ["- Fecha Emision: Formato YYYY-MM-DD"],
    ["- Fecha Vencimiento: Formato YYYY-MM-DD"],
    ["- Forma de Pago: TRANSFERENCIA, EFECTIVO o CHEQUE"],
    ["- RFC Emisor: RFC del emisor (12-13 caracteres)"],
    ["- RFC Receptor: RFC del receptor (12-13 caracteres)"],
    [""],
    ["Columnas Opcionales:"],
    ["- Direccion Emisor: Direccion del emisor"],
    ["- Direccion Receptor: Direccion del receptor"],
    ["- Numero Cuenta: Numero de cuenta bancaria"],
    ["- CLABE: Clave bancaria (18 digitos)"],
    ["- Banco: Nombre del banco"],
    ["- Notas: Notas adicionales"],
    [""],
    ["NOTAS IMPORTANTES:"],
    ["1. El sistema buscara automaticamente Ingresos/Egresos por el Folio Fiscal"],
    ["2. Si el cliente no existe, se creara automaticamente"],
    ["3. Si el Folio Fiscal ya existe, se mostrara como duplicado"],
    ["4. Las facturas sin vinculacion a I/E seran omitidas"],
    [""],
    ["Tamano maximo del archivo: 10MB"],
  ];

  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
  instructionsSheet["!cols"] = [{ wch: 80 }];

  // Crear workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Facturas");
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instrucciones");

  // Generar nombre de archivo
  const fileName = `plantilla_importar_facturas_${
    new Date().toISOString().split("T")[0]
  }.xlsx`;

  // Descargar archivo
  XLSX.writeFile(workbook, fileName);
}
