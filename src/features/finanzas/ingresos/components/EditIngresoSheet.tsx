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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide}>
        <SheetHeader>
          <SheetTitle>Editar Ingreso</SheetTitle>
          <SheetDescription>
            Modifica la información del ingreso:
          </SheetDescription>
        </SheetHeader>
        <div className="h-[80vh] overflow-y-auto">
          <EditIngresoForm ingreso={ingreso} onSuccess={onClose} />
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

