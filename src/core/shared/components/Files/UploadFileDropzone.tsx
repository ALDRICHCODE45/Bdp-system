"use client";

import { Upload, X } from "lucide-react";
import { toast } from "sonner";
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
import { useCallback, useState } from "react";
import { uploadFileAction } from "@/features/Files/server/actions/uploadFileAction";

interface FileUploadDropZoneProps {
  entityType: "FACTURA" | "EGRESO" | "INGRESO" | "CLIENTE_PROVEEDOR";
  entityId: string;
  onUploadSuccess?: () => void;
  maxFiles?: number;
  maxSize?: number; // en bytes
}

export function FileUploadDropZone({
  entityType,
  entityId,
  onUploadSuccess,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB por defecto
}: FileUploadDropZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const onFileReject = useCallback((file: File, message: string) => {
    toast.error(message, {
      description: `"${
        file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
      }" ha sido rechazado`,
    });
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("No hay archivos para subir");
      return;
    }

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("entityType", entityType);
        formData.append("entityId", entityId);

        const result = await uploadFileAction(formData);

        if (!result.ok) {
          toast.error(result.error || `Error al subir ${file.name}`);
        }
      }

      toast.success("Archivos subidos correctamente");
      setFiles([]);
      onUploadSuccess?.();
    } catch (error) {
      toast.error("Error al subir los archivos");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <FileUpload
        maxFiles={maxFiles}
        maxSize={maxSize}
        className="w-full"
        value={files}
        onValueChange={setFiles}
        onFileReject={onFileReject}
        multiple
      >
        <FileUploadDropzone>
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center justify-center rounded-full border p-2.5">
              <Upload className="size-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-sm">
              Arrastra y suelta tus archivos aquí
            </p>
            <p className="text-muted-foreground text-xs">
              O haz clic para buscar (máx. {maxFiles} archivos, hasta{" "}
              {Math.round(maxSize / 1024 / 1024)} MB cada uno)
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Formatos permitidos: PDF, XML, Excel, Word
            </p>
          </div>
          <FileUploadTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2 w-fit">
              Buscar archivos
            </Button>
          </FileUploadTrigger>
        </FileUploadDropzone>
        <FileUploadList>
          {files.map((file, index) => (
            <FileUploadItem key={index} value={file}>
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
      {files.length > 0 && (
        <Button onClick={handleUpload} disabled={uploading} className="w-full">
          {uploading ? "Subiendo..." : `Subir ${files.length} archivo(s)`}
        </Button>
      )}
    </div>
  );
}
