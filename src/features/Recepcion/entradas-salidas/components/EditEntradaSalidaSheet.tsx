"use client";
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
import { EditEntradaSalidaForm } from "./forms/EditEntradaSalidaForm";
import { EntradasSalidasDTO } from "../server/dtos/EntradasSalidasDto.dto";

interface EditEntradaSalidaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  entradaSalida: EntradasSalidasDTO;
}

export function EditEntradaSalidaSheet({
  isOpen,
  onClose,
  entradaSalida,
}: EditEntradaSalidaSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide}>
        <SheetHeader>
          <SheetTitle>Editar Entrada/Salida</SheetTitle>
          <SheetDescription>
            Modifica la información de la entrada/salida:
          </SheetDescription>
        </SheetHeader>
        <div className="h-[80vh] overflow-y-auto">
          <EditEntradaSalidaForm entradaSalida={entradaSalida} onSuccess={onClose} />
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

