"use client";

import { useState } from "react";
import { FileEntity } from "@/features/Files/server/entities/File.entity";
import { Button } from "@/core/shared/ui/button";
import { Badge } from "@/core/shared/ui/badge";
import { Trash2, Download, File } from "lucide-react";
import { deleteFileAction } from "@/features/Files/server/actions/deleteFileAction";
import { DocumentExpiryBadge } from "@/core/shared/components/DocumentExpiryBadge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/core/shared/ui/alert-dialog";

/**
 * P5 — widened entityType union to include COLABORADOR (cap12 req1). The
 * list now renders the expiry badge (`DocumentExpiryBadge`, CC9) and a
 * category chip whenever those fields are populated. Existing entityTypes
 * are unaffected because both fields are nullable.
 */
interface FileListProps {
  files: FileEntity[];
  entityType:
    | "FACTURA"
    | "MOVIMIENTO"
    | "CLIENTE_PROVEEDOR"
    | "COLABORADOR";
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
    } catch {
      toast.error("Error al eliminar el archivo");
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleDownload = (fileUrl: string, _fileName: string) => {
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
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm truncate">{file.fileName}</p>
                {file.category ? (
                  <Badge variant="secondary" className="text-[10px]">
                    {categoryLabel(file.category)}
                  </Badge>
                ) : null}
                <DocumentExpiryBadge
                  expiryDate={file.expiryDate}
                  className="text-[10px]"
                />
              </div>
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

/**
 * Display label for the `DocumentCategory` enum. Used by the badge chip in
 * each file row of the Documentos tab. Kept here (next to the render code
 * that uses it) so the labels stay in lockstep with the enum from Prisma.
 */
function categoryLabel(category: string): string {
  switch (category) {
    case "CONTRATO":
      return "Contrato";
    case "INE":
      return "INE";
    case "RFC":
      return "RFC";
    case "COMPROBANTE_DOMICILIO":
      return "Comprobante de domicilio";
    case "OTRO":
      return "Otro";
    default:
      return category;
  }
}
