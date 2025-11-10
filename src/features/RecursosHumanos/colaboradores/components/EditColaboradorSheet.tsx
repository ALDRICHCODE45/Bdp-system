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
import { EditColaboradorForm } from "./forms/EditColaboradorForm";
import { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";

interface EditColaboradorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  colaborador: ColaboradorDto;
}

export function EditColaboradorSheet({
  isOpen,
  onClose,
  colaborador,
}: EditColaboradorSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide}>
        <SheetHeader>
          <SheetTitle>Editar Colaborador</SheetTitle>
          <SheetDescription>
            Modifica la información del colaborador:
          </SheetDescription>
        </SheetHeader>
        <div className="h-[80vh] overflow-y-auto">
          <EditColaboradorForm colaborador={colaborador} onSuccess={onClose} />
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
