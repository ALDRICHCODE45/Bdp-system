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
import { EditClienteProveedorForm } from "./forms/EditClienteProveedorForm";
import { ClienteProveedorDto } from "../server/dtos/ClienteProveedorDto.dto";
import { Separator } from "@/core/shared/ui/separator";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";
import { useEffect, useState } from "react";
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

interface EditClienteProveedorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  clienteProveedor: ClienteProveedorDto;
}

export function EditClienteProveedorSheet({
  isOpen,
  onClose,
  clienteProveedor,
}: EditClienteProveedorSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";
  const [files, setFiles] = useState<FileEntity[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const loadFiles = async () => {
    if (!clienteProveedor) return;
    setLoadingFiles(true);
    try {
      const result = await getFilesByEntityAction(
        "CLIENTE_PROVEEDOR",
        clienteProveedor.id
      );
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
    if (isOpen && clienteProveedor) {
      loadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, clienteProveedor?.id]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide} className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Editar Cliente/Proveedor</SheetTitle>
          <SheetDescription>
            Modifica la información del cliente o proveedor y gestiona sus
            archivos:
          </SheetDescription>
        </SheetHeader>
        <div className="h-[80vh] overflow-y-auto space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Datos del Cliente/Proveedor
            </h3>
            <EditClienteProveedorForm
              clienteProveedor={clienteProveedor}
              onSuccess={onClose}
            />
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4">Archivos Adjuntos</h3>
            <FileUploadDropZone
              entityType="CLIENTE_PROVEEDOR"
              entityId={clienteProveedor.id}
              onUploadSuccess={loadFiles}
            />
            {loadingFiles ? (
              <LoadingModalState />
            ) : (
              <div className="mt-4">
                <FileList
                  files={files}
                  entityType="CLIENTE_PROVEEDOR"
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

