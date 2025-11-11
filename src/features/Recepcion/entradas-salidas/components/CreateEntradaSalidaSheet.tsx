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
import { CreateEntradaSalidaForm } from "./forms/CreateEntradaSalidaForm";

interface CreateEntradaSalidaSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateEntradaSalidaSheet({
  isOpen,
  onClose,
}: CreateEntradaSalidaSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide}>
        <SheetHeader>
          <SheetTitle>Agregar Entrada/Salida</SheetTitle>
          <SheetDescription>Ingresa la siguiente información:</SheetDescription>
        </SheetHeader>
        <div className="h-[80vh] overflow-y-auto">
          <CreateEntradaSalidaForm onSuccess={onClose} />
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
