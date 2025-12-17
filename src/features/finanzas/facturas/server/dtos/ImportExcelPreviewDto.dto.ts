import { FacturaDto } from "./FacturaDto.dto";
import {
  ImportFacturaExcelRowDto,
  ValidatedExcelRowDto,
} from "./ImportFacturaExcelRowDto.dto";

/**
 * DTO para una factura duplicada encontrada
 */
export type DuplicadaDto = {
  row: ValidatedExcelRowDto;
  existing: FacturaDto;
  shouldUpdate: boolean;
};

/**
 * DTO para un cliente nuevo detectado
 */
export type ClienteNuevoDto = {
  nombre: string;
  rfc: string;
  rowNumbers: number[];
};

/**
 * DTO para un error de validación
 */
export type ErrorValidacionDto = {
  rowNumber: number;
  errors: string[];
  rawData: Partial<ImportFacturaExcelRowDto>;
};

/**
 * DTO que representa el preview completo de la importación
 * Contiene toda la información necesaria para que el usuario revise
 * antes de confirmar la importación.
 */
export type ImportExcelPreviewDto = {
  // Archivo procesado
  fileName: string;
  totalRows: number;

  // Facturas nuevas a crear
  nuevas: ValidatedExcelRowDto[];

  // Facturas duplicadas (ya existen en BD)
  duplicadas: DuplicadaDto[];

  // Clientes que se crearán automáticamente
  clientesNuevos: ClienteNuevoDto[];

  // Filas con errores de validación
  errores: ErrorValidacionDto[];

  // Resumen
  resumen: {
    totalNuevas: number;
    totalDuplicadas: number;
    totalClientesNuevos: number;
    totalErrores: number;
    totalConVinculacion: number;
    totalSinVinculacion: number;
  };
};

/**
 * Opciones para ejecutar la importación
 */
export type ImportOptionsDto = {
  // IDs de filas duplicadas que el usuario quiere actualizar
  duplicadasAActualizar: string[];
  // Si es true, actualiza todas las duplicadas
  actualizarTodasDuplicadas: boolean;
};
