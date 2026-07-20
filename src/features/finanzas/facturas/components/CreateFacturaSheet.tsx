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
import { CreateFacturaForm } from "./forms/CreateFacturaForm";

interface CreateFacturaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isCapturador?: boolean;
}

export function CreateFacturaSheet({
  isOpen,
  onClose,
  isCapturador = false,
}: CreateFacturaSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={sheetSide}
        className="w-full sm:min-w-[800px] lg:min-w-[800px]"
      >
        <SheetHeader>
          <SheetTitle>Agregar factura</SheetTitle>
          <SheetDescription>
            Completá los datos del CFDI para registrar la factura.
          </SheetDescription>
        </SheetHeader>
        <div className="h-[80vh] overflow-y-auto">
          <CreateFacturaForm onSuccess={onClose} isCapturador={isCapturador} />
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
