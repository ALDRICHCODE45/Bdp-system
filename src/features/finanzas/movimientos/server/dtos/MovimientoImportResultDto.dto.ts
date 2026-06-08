import type { ImportExecutionResultDto } from "@/core/shared/excel-import/types/excel-import.types";
import type { MovimientoImportRowDto } from "./MovimientoImportRowDto.dto";

/**
 * Result DTO returned after executing a movimientos Excel import.
 * Uses the generic ImportExecutionResultDto with movimiento-specific row shape.
 */
export type MovimientoImportResultDto =
  ImportExecutionResultDto<MovimientoImportRowDto>;
