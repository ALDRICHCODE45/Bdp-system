// Types
export type {
  ImportStep,
  ImportRowError,
  FieldChange,
  ImportError,
  ImportDuplicate,
  ImportPreviewDto,
  ImportExecutionResultDto,
  ImportRowDetailDto,
  ImportConfig,
} from "./types/excel-import.types";

// Helpers
export {
  parseNumericCell,
  parseCellToString,
  normalizeColumnHeader,
  detectHeaderRow,
  isEmptyRow,
  parseSpanishDate,
  buildDedupSet,
} from "./helpers";

export type {
  HeaderDetectionResult,
  HeaderDetectionError,
} from "./helpers";

export type { DedupResult } from "./helpers";

// Components
export {
  GenericImportDialog,
  GenericDropzone,
  GenericProgress,
  GenericResults,
} from "./components";

export type {
  GenericImportDialogProps,
  GenericDropzoneProps,
  GenericProgressProps,
  GenericResultsProps,
} from "./components";

// Hooks
export { useImportState, useImportPreview, useImportExecute } from "./hooks";

export type {
  ImportState,
  UseImportStateReturn,
  UseImportPreviewOptions,
  UseImportExecuteOptions,
  ImportExecuteParams,
} from "./hooks";

