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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide}>
        <SheetHeader>
          <SheetTitle>Editar Egreso</SheetTitle>
          <SheetDescription>
            Modifica la información del egreso:
          </SheetDescription>
        </SheetHeader>
        <div className="h-[80vh] overflow-y-auto">
          <EditEgresoForm egreso={egreso} onSuccess={onClose} />
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

