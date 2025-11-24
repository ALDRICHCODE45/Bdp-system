"use client";

import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { Button } from "@/core/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/shared/ui/dialog";
import { FileList } from "@/core/shared/components/Files/FileList";
import { getFilesByEntityAction } from "@/features/Files/server/actions/getFilesByEntityAction";
import { FileEntity } from "@/features/Files/server/entities/File.entity";
import { FolderUp } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const FileUploadDropZone = dynamic(
  () =>
    import("@/core/shared/components/Files/UploadFileDropzone").then((mod) => ({
      default: mod.FileUploadDropZone,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

interface UploadClienteProveedorColumnProps {
  clienteProveedorId: string;
}

export const UploadClienteProveedorColumn = ({
  clienteProveedorId,
}: UploadClienteProveedorColumnProps) => {
  const [files, setFiles] = useState<FileEntity[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const result = await getFilesByEntityAction(
        "CLIENTE_PROVEEDOR",
        clienteProveedorId
      );
      if (result.ok && result.data) {
        setFiles(result.data);
      }
    } catch (error) {
      console.error("Error al cargar archivos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, clienteProveedorId]);

  const handleUploadSuccess = () => {
    loadFiles();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          buttonTooltip
          buttonTooltipText="Subir archivos"
          size="icon"
        >
          <FolderUp />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Archivos del cliente/proveedor</DialogTitle>
          <DialogDescription>
            Sube y gestiona los archivos relacionados con este registro (PDF,
            XML, Excel, Word)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FileUploadDropZone
            entityType="CLIENTE_PROVEEDOR"
            entityId={clienteProveedorId}
            onUploadSuccess={handleUploadSuccess}
          />
          {loading ? (
            <LoadingModalState />
          ) : (
            <FileList
              files={files}
              entityType="CLIENTE_PROVEEDOR"
              onFileDeleted={handleUploadSuccess}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};


