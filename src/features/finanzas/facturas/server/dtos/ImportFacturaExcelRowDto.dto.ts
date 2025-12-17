/**
 * DTO que representa una fila del archivo Excel de importación de facturas.
 * Estos son los datos crudos extraídos del Excel antes de ser procesados.
 */
export type ImportFacturaExcelRowDto = {
  rowNumber: number;
  numeroFactura: string;
  folioFiscal: string;
  clienteProveedor: string;
  rfcClienteProveedor: string;
  concepto: string;
  monto: number;
  periodo: string;
  fechaEmision: Date;
  fechaVencimiento: Date;
  formaPago: "TRANSFERENCIA" | "EFECTIVO" | "CHEQUE";
  rfcEmisor: string;
  rfcReceptor: string;
  direccionEmisor: string;
  direccionReceptor: string;
  numeroCuenta: string;
  clabe: string;
  banco: string;
  notas?: string | null;
};

/**
 * Fila validada con información adicional de procesamiento
 */
export type ValidatedExcelRowDto = ImportFacturaExcelRowDto & {
  isValid: boolean;
  errors: string[];
  // Información de vinculación encontrada
  vinculacion: {
    tipoOrigen: "INGRESO" | "EGRESO";
    origenId: string;
    encontrado: boolean;
  } | null;
  // Información del cliente encontrado o a crear
  clienteInfo: {
    id: string | null;
    nombre: string;
    rfc: string;
    existe: boolean;
  };
};
