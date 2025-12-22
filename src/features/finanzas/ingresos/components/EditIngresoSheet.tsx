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
import { EditIngresoForm } from "./forms/EditIngresoForm";
import { IngresoDto } from "../server/dtos/IngresoDto.dto";
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
  },
);

interface EditIngresoSheetProps {
  ingreso: IngresoDto;
  isOpen: boolean;
  onClose: () => void;
}

export function EditIngresoSheet({
  ingreso,
  isOpen,
  onClose,
}: EditIngresoSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";
  const [files, setFiles] = useState<FileEntity[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const loadFiles = async () => {
    if (!ingreso) return;
    setLoadingFiles(true);
    try {
      const result = await getFilesByEntityAction("INGRESO", ingreso.id);
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
    if (isOpen && ingreso) {
      loadFiles();
    }
  }, [isOpen, ingreso?.id]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide} className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Editar Ingreso</SheetTitle>
          <SheetDescription>
            Modifica la información del ingreso y gestiona sus archivos:
          </SheetDescription>
        </SheetHeader>
        <div className="h-[80vh] overflow-y-auto space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 pl-5">
              Datos del Ingreso
            </h3>
            <EditIngresoForm ingreso={ingreso} onSuccess={onClose} />
          </div>
          <Separator />
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Archivos Adjuntos</h3>
            <FileUploadDropZone
              entityType="INGRESO"
              entityId={ingreso.id}
              onUploadSuccess={loadFiles}
            />
            {loadingFiles ? (
              <LoadingModalState />
            ) : (
              <div className="p-[10px]">
                <FileList
                  files={files}
                  entityType="INGRESO"
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
