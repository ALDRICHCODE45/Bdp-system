import type { ImportPreviewDto } from "@/core/shared/excel-import/types/excel-import.types";
import type { MovimientoImportRowDto } from "./MovimientoImportRowDto.dto";

/**
 * Preview DTO returned after parsing and validating an Excel import file.
 * Extends the generic ImportPreviewDto with movimiento-specific row shape
 * and a tempFileKey for server-side re-read on execute.
 */
export type MovimientoImportPreviewDto =
  ImportPreviewDto<MovimientoImportRowDto> & {
    /** S3 / temp storage key so execute can re-read the file */
    tempFileKey: string;
  };
