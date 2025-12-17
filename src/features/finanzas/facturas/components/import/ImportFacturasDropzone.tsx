"use client";

import { Upload, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/core/shared/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/core/shared/ui/file-upload";
import { useCallback } from "react";
import { toast } from "sonner";

interface ImportFacturasDropzoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onProcess: () => void;
  isProcessing: boolean;
}

export function ImportFacturasDropzone({
  file,
  onFileChange,
  onProcess,
  isProcessing,
}: ImportFacturasDropzoneProps) {
  const maxSize = 10 * 1024 * 1024; // 10MB

  const onFileReject = useCallback((rejectedFile: File, message: string) => {
    toast.error(message, {
      description: `"${
        rejectedFile.name.length > 20
          ? `${rejectedFile.name.slice(0, 20)}...`
          : rejectedFile.name
      }" ha sido rechazado`,
    });
  }, []);

  const handleFileChange = useCallback(
    (files: File[]) => {
      onFileChange(files[0] || null);
    },
    [onFileChange]
  );

  const files = file ? [file] : [];

  return (
    <div className="w-full space-y-4">
      <FileUpload
        maxFiles={1}
        maxSize={maxSize}
        accept=".xlsx,.xls"
        className="w-full"
        value={files}
        onValueChange={handleFileChange}
        onFileReject={onFileReject}
      >
        <FileUploadDropzone>
          <div className="flex flex-col items-center gap-2 text-center py-4">
            <div className="flex items-center justify-center rounded-full border-2 border-dashed p-4">
              <FileSpreadsheet className="size-8 text-green-600" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm">
                Arrastra y suelta tu archivo Excel aquí
              </p>
              <p className="text-muted-foreground text-xs">
                O haz clic para buscar (máximo 10 MB)
              </p>
              <p className="text-muted-foreground text-xs">
                Formatos permitidos: .xlsx, .xls
              </p>
            </div>
            <FileUploadTrigger asChild>
              <Button variant="outline" size="sm" className="mt-2">
                <Upload className="mr-2 h-4 w-4" />
                Seleccionar archivo
              </Button>
            </FileUploadTrigger>
          </div>
        </FileUploadDropzone>
        <FileUploadList>
          {files.map((f, index) => (
            <FileUploadItem key={index} value={f}>
              <FileUploadItemPreview />
              <FileUploadItemMetadata />
              <FileUploadItemDelete asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <X />
                </Button>
              </FileUploadItemDelete>
            </FileUploadItem>
          ))}
        </FileUploadList>
      </FileUpload>

      {file && (
        <Button
          onClick={onProcess}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <span className="animate-spin mr-2">
                <Upload className="h-4 w-4" />
              </span>
              Procesando archivo...
            </>
          ) : (
            <>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Procesar archivo
            </>
          )}
        </Button>
      )}
    </div>
  );
}
