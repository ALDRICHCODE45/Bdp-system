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
import { EditEgresoForm } from "./forms/EditEgresoForm";
import { EgresoDto } from "../server/dtos/EgresoDto.dto";
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

interface EditEgresoSheetProps {
  egreso: EgresoDto;
  isOpen: boolean;
  onClose: () => void;
}

export function EditEgresoSheet({
  egreso,
  isOpen,
  onClose,
}: EditEgresoSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";
  const [files, setFiles] = useState<FileEntity[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const loadFiles = async () => {
    if (!egreso) return;
    setLoadingFiles(true);
    try {
      const result = await getFilesByEntityAction("EGRESO", egreso.id);
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
    if (isOpen && egreso) {
      loadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, egreso?.id]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide} className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Editar Egreso</SheetTitle>
          <SheetDescription>
            Modifica la información del egreso y gestiona sus archivos:
          </SheetDescription>
        </SheetHeader>
        <div className="h-[80vh] overflow-y-auto space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Datos del Egreso</h3>
            <EditEgresoForm egreso={egreso} onSuccess={onClose} />
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4">Archivos Adjuntos</h3>
            <FileUploadDropZone
              entityType="EGRESO"
              entityId={egreso.id}
              onUploadSuccess={loadFiles}
            />
            {loadingFiles ? (
              <LoadingModalState />
            ) : (
              <div className="mt-4">
                <FileList
                  files={files}
                  entityType="EGRESO"
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

