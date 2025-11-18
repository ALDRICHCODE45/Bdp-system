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
import { CreateEgresoForm } from "./forms/CreateEgresoForm";

interface CreateEgresoSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateEgresoSheet({
  isOpen,
  onClose,
}: CreateEgresoSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide}>
        <SheetHeader>
          <SheetTitle>Agregar Egreso</SheetTitle>
          <SheetDescription>
            Ingresa la información del egreso:
          </SheetDescription>
        </SheetHeader>
        <div className="h-[80vh] overflow-y-auto">
          <CreateEgresoForm onSuccess={onClose} />
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

