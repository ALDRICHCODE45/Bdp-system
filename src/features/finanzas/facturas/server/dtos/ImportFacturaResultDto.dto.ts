/**
 * DTO que representa el resultado de importar una fila individual
 */
export type ImportFacturaResultDto = {
  rowNumber: number;
  folioFiscal: string;
  status: "created" | "updated" | "skipped" | "error";
  message: string;
  facturaId?: string;
  clienteCreado?: {
    id: string;
    nombre: string;
    rfc: string;
  };
  // Para facturas que crearon un I/E automáticamente
  ingresoCreado?: {
    id: string;
    folioFiscal: string;
  };
  egresoCreado?: {
    id: string;
    folioFiscal: string;
  };
};

/**
 * DTO que representa el resultado completo de la ejecución de importación
 */
export type ImportExecutionResultDto = {
  success: boolean;
  totalProcesadas: number;
  creadas: number;
  actualizadas: number;
  omitidas: number;
  errores: number;
  clientesCreados: number;
  ingresosCreados: number;
  egresosCreados: number;
  resultados: ImportFacturaResultDto[];
};
