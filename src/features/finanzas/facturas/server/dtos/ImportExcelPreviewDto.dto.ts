import { FacturaDto } from "./FacturaDto.dto";
import {
  ImportFacturaExcelRowDto,
  ValidatedExcelRowDto,
} from "./ImportFacturaExcelRowDto.dto";

/**
 * Representa un cambio detectado entre un campo del Excel y el valor en sistema.
 */
export type FieldChange = {
  /** Nombre interno del campo */
  field: string;
  /** Label legible en español */
  label: string;
  /** Valor actual en el sistema */
  oldValue: string | number | null;
  /** Valor nuevo proveniente del Excel */
  newValue: string | number | null;
  /**
   * true cuando el cambio afecta campos financieros o fiscales críticos
   * (total, subtotal, impuestos, RFC, moneda).
   */
  isHighRisk: boolean;
};

/**
 * DTO para una factura duplicada encontrada.
 * Incluye el diff completo de campos entre el Excel y el sistema.
 */
export type DuplicadaDto = {
  row: ValidatedExcelRowDto;
  existing: FacturaDto;
  shouldUpdate: boolean;
  /** Campos que difieren entre el Excel y el sistema */
  changedFields: FieldChange[];
  /** true si alguno de los cambios es de alto riesgo */
  hasHighRiskChanges: boolean;
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
  /** Fila de Excel donde se detectó el header (útil para mostrar al usuario) */
  headerExcelRow?: number;

  // Facturas nuevas a crear
  nuevas: ValidatedExcelRowDto[];

  // Facturas duplicadas (ya existen en BD)
  duplicadas: DuplicadaDto[];

  // Filas con errores de validación
  errores: ErrorValidacionDto[];

  // Resumen
  resumen: {
    totalNuevas: number;
    totalDuplicadas: number;
    totalErrores: number;
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
