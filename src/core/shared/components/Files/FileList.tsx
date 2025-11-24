"use client";

import { useState } from "react";
import { FileEntity } from "@/features/Files/server/entities/File.entity";
import { Button } from "@/core/shared/ui/button";
import { Trash2, Download, File } from "lucide-react";
import { deleteFileAction } from "@/features/Files/server/actions/deleteFileAction";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/core/shared/ui/alert-dialog";

interface FileListProps {
  files: FileEntity[];
  entityType: "FACTURA" | "EGRESO" | "INGRESO" | "CLIENTE_PROVEEDOR";
  onFileDeleted?: () => void;
}

export function FileList({ files, entityType, onFileDeleted }: FileListProps) {
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  const handleDelete = async (fileId: string) => {
    setDeletingFileId(fileId);
    try {
      const formData = new FormData();
      formData.append("fileId", fileId);
      formData.append("entityType", entityType);

      const result = await deleteFileAction(formData);

      if (!result.ok) {
        toast.error(result.error || "Error al eliminar el archivo");
        return;
      }

      toast.success("Archivo eliminado correctamente");
      onFileDeleted?.();
    } catch (error) {
      toast.error("Error al eliminar el archivo");
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    window.open(fileUrl, "_blank");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("xml")) return "📋";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return "📊";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    return "📎";
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <File className="mx-auto h-12 w-12 mb-2 opacity-50" />
        <p>No hay archivos adjuntos</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.fileSize)} •{" "}
                {new Date(file.createdAt).toLocaleDateString("es-MX")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownload(file.fileUrl, file.fileName)}
              className="h-8 w-8"
            >
              <Download className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={deletingFileId === file.id}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. El archivo será eliminado
                    permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <Button
                    onClick={() => handleDelete(file.id)}
                    variant={"destructive-outline"}
                  >
                    Eliminar
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}
