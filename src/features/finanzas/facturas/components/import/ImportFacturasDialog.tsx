"use client";

import { FileSpreadsheet, ArrowLeft, ArrowRight, Download } from "lucide-react";
import { Button } from "@/core/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/shared/ui/dialog";
import { useImportFacturasState } from "../../hooks/useImportFacturasState.hook";
import { useImportFacturasPreview } from "../../hooks/useImportFacturasPreview.hook";
import { useImportFacturasExecute } from "../../hooks/useImportFacturasExecute.hook";
import { ImportFacturasDropzone } from "./ImportFacturasDropzone";
import { ImportFacturasPreview } from "./ImportFacturasPreview";
import { ImportFacturasProgress } from "./ImportFacturasProgress";
import { ImportFacturasResults } from "./ImportFacturasResults";
import { generateExcelTemplate } from "../../helpers/generateExcelTemplate";

interface ImportFacturasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportFacturasDialog({
  open,
  onOpenChange,
}: ImportFacturasDialogProps) {
  const state = useImportFacturasState();
  const previewMutation = useImportFacturasPreview();
  const executeMutation = useImportFacturasExecute();

  const handleClose = () => {
    state.reset();
    previewMutation.reset();
    executeMutation.reset();
    onOpenChange(false);
  };

  const handleProcessFile = async () => {
    if (!state.file) return;

    const result = await previewMutation.mutateAsync(state.file);
    state.setPreview(result);
  };

  const handleExecuteImport = async () => {
    if (!state.preview) return;

    state.startExecution();

    const result = await executeMutation.mutateAsync({
      preview: state.preview,
      options: state.options,
    });

    state.setResults(result);
  };

  const handleDownloadTemplate = () => {
    generateExcelTemplate();
  };

  const canExecute =
    state.preview &&
    (state.preview.nuevas.length > 0 ||
      state.options.actualizarTodasDuplicadas ||
      state.options.duplicadasAActualizar.length > 0);

  const getTotalToImport = () => {
    if (!state.preview) return 0;

    const nuevasConVinculacion = state.preview.nuevas.filter(
      (n) => n.vinculacion?.encontrado
    ).length;

    const duplicadasAActualizar = state.options.actualizarTodasDuplicadas
      ? state.preview.duplicadas.length
      : state.options.duplicadasAActualizar.length;

    return nuevasConVinculacion + duplicadasAActualizar;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Facturas desde Excel
          </DialogTitle>
          <DialogDescription>
            {state.step === "upload" &&
              "Sube un archivo Excel con las facturas a importar."}
            {state.step === "preview" &&
              "Revisa los datos antes de confirmar la importacion."}
            {state.step === "executing" && "Procesando importacion..."}
            {state.step === "results" && "Resultados de la importacion."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {state.step === "upload" && (
            <div className="space-y-4">
              <ImportFacturasDropzone
                file={state.file}
                onFileChange={state.setFile}
                onProcess={handleProcessFile}
                isProcessing={previewMutation.isPending}
              />

              <div className="border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar plantilla de ejemplo
                </Button>
              </div>
            </div>
          )}

          {state.step === "preview" && state.preview && (
            <ImportFacturasPreview
              preview={state.preview}
              duplicadasAActualizar={state.options.duplicadasAActualizar}
              actualizarTodasDuplicadas={state.options.actualizarTodasDuplicadas}
              onToggleDuplicada={state.toggleDuplicadaUpdate}
              onToggleActualizarTodas={state.toggleActualizarTodas}
            />
          )}

          {state.step === "executing" && <ImportFacturasProgress />}

          {state.step === "results" && state.results && (
            <ImportFacturasResults
              results={state.results}
              onClose={handleClose}
              onNewImport={state.reset}
            />
          )}
        </div>

        {state.step !== "results" && state.step !== "executing" && (
          <DialogFooter className="border-t pt-4">
            {state.step === "upload" && (
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            )}

            {state.step === "preview" && (
              <>
                <Button
                  variant="outline"
                  onClick={state.goToUpload}
                  className="mr-auto"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>

                <Button
                  onClick={handleExecuteImport}
                  disabled={!canExecute || executeMutation.isPending}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Importar {getTotalToImport()} factura(s)
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
