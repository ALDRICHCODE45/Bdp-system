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
}

export function CreateFacturaSheet({
  isOpen,
  onClose,
}: CreateFacturaSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide}>
        <SheetHeader>
          <SheetTitle>Agregar Factura</SheetTitle>
          <SheetDescription>
            Ingresa la información de la factura:
          </SheetDescription>
        </SheetHeader>
        <div className="h-[80vh] overflow-y-auto">
          <CreateFacturaForm onSuccess={onClose} />
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
