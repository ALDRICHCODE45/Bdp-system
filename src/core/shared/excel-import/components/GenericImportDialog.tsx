"use client";

import type { ReactNode } from "react";
import { FileSpreadsheet, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/core/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/shared/ui/dialog";
import type { ImportState } from "../hooks/useImportState.hook";
import { GenericDropzone } from "./GenericDropzone";
import { GenericProgress } from "./GenericProgress";
import { GenericResults } from "./GenericResults";

export interface GenericImportDialogProps<TPreview, TResult> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  state: ImportState<TPreview, TResult>;
  onUpload: (file: File) => void;
  onConfirm: () => void;
  onReset: () => void;
  /** Feature-specific preview rendering. */
  renderPreview: (preview: TPreview) => ReactNode;
  /** Feature-specific result summary cards. */
  renderResultSummary: (result: TResult) => ReactNode;
  /** Feature-specific result detail accordion. */
  renderResultDetails: (result: TResult) => ReactNode;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
  /** Extra content to render below the dropzone (e.g., template download). */
  uploadFooter?: ReactNode;
  /** Text for the confirm button. Default: "Import". */
  confirmLabel?: string;
  /** Whether the confirm button is enabled. Default: true when preview exists. */
  canConfirm?: boolean;
  /** Whether the preview step is loading (processing file). */
  isProcessing?: boolean;
  /** Label for the processing button. */
  processingLabel?: string;
  /** Message shown during the executing step. */
  executingMessage?: string;
  /** Called when the user removes the selected file in upload step. */
  onFileClear?: () => void;
  /** Callback to process the file (upload step -> preview step). */
  onProcessFile?: () => void;
  /** Called when the user clicks "Back" from preview step. */
  onGoBack?: () => void;
}

export function GenericImportDialog<TPreview, TResult>({
  open,
  onOpenChange,
  title,
  description,
  state,
  onUpload,
  onConfirm,
  onReset,
  renderPreview,
  renderResultSummary,
  renderResultDetails,
  acceptedFileTypes = ".xlsx,.xls",
  maxFileSizeMB = 10,
  uploadFooter,
  confirmLabel = "Import",
  canConfirm = true,
  isProcessing = false,
  processingLabel,
  executingMessage,
  onFileClear,
  onProcessFile,
  onGoBack,
}: GenericImportDialogProps<TPreview, TResult>) {
  const handleClose = () => {
    onReset();
    onOpenChange(false);
  };

  const getDescription = () => {
    if (description) return description;
    switch (state.step) {
      case "upload":
        return "Upload an Excel file to import.";
      case "preview":
        return "Review the data before confirming the import.";
      case "executing":
        return "Processing import...";
      case "results":
        return "Import results.";
      default:
        return undefined;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {/* Step: Upload */}
          {state.step === "upload" && (
            <div className="space-y-4">
              <GenericDropzone
                onFileSelected={onUpload}
                acceptedFileTypes={acceptedFileTypes}
                maxFileSizeMB={maxFileSizeMB}
                selectedFile={state.file}
                onFileClear={onFileClear}
              />

              {state.file && onProcessFile && (
                <Button
                  onClick={onProcessFile}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    processingLabel ?? "Processing file..."
                  ) : (
                    <>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Process file
                    </>
                  )}
                </Button>
              )}

              {uploadFooter}
            </div>
          )}

          {/* Step: Preview */}
          {state.step === "preview" && state.preview && (
            renderPreview(state.preview)
          )}

          {/* Step: Executing */}
          {state.step === "executing" && (
            <GenericProgress message={executingMessage} />
          )}

          {/* Step: Results */}
          {state.step === "results" && state.result && (
            <GenericResults
              result={state.result}
              renderSummary={renderResultSummary}
              renderDetails={renderResultDetails}
              onClose={handleClose}
              onReset={onReset}
            />
          )}
        </div>

        {/* Footer with navigation buttons */}
        {state.step !== "results" && state.step !== "executing" && (
          <DialogFooter className="border-t pt-4">
            {state.step === "upload" && (
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            )}

            {state.step === "preview" && (
              <>
                <Button
                  variant="outline"
                  onClick={onGoBack}
                  className="mr-auto"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <Button onClick={onConfirm} disabled={!canConfirm}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  {confirmLabel}
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
