import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { Button } from "@/core/shared/ui/button";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { EditFacturaForm } from "./forms/EditFacturaForm";
import { FacturaDto } from "../server/dtos/FacturaDto.dto";
import { Separator } from "@/core/shared/ui/separator";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { useState, useEffect } from "react";
import { getFilesByEntityAction } from "@/features/Files/server/actions/getFilesByEntityAction";
import { FileList } from "@/core/shared/components/Files/FileList";
import { FileEntity } from "@/features/Files/server/entities/File.entity";

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

interface EditFacturaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  factura: FacturaDto | null;
}

export function EditFacturaSheet({
  isOpen,
  onClose,
  factura,
}: EditFacturaSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";
  const [files, setFiles] = useState<FileEntity[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const loadFiles = async () => {
    if (!factura) return;
    setLoadingFiles(true);
    try {
      const result = await getFilesByEntityAction("FACTURA", factura.id);
      if (result.ok && result.data) {
        setFiles(result.data);
      }
    } catch (error) {
      console.error("Error al cargar archivos:", error);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (isOpen && factura) {
      loadFiles();
    }
  }, [isOpen, factura?.id]);

  if (!factura) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide} className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Editar Factura</SheetTitle>
          <SheetDescription>
            Modifica la información de la factura y gestiona sus archivos:
          </SheetDescription>
        </SheetHeader>
        <div className="h-[80vh] overflow-y-auto space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Datos de la Factura</h3>
            <EditFacturaForm factura={factura} onSuccess={onClose} />
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4">Archivos Adjuntos</h3>
            <FileUploadDropZone
              entityType="FACTURA"
              entityId={factura.id}
              onUploadSuccess={loadFiles}
            />
            {loadingFiles ? (
              <LoadingModalState />
            ) : (
              <div className="mt-4">
                <FileList
                  files={files}
                  entityType="FACTURA"
                  onFileDeleted={loadFiles}
                />
              </div>
            )}
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
