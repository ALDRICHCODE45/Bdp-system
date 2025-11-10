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
import { EditSocioForm } from "./forms/EditSocioForm";
import { SocioDto } from "../server/dtos/SocioDto.dto";

interface EditSocioSheetProps {
  isOpen: boolean;
  onClose: () => void;
  socio: SocioDto;
}

export function EditSocioSheet({
  isOpen,
  onClose,
  socio,
}: EditSocioSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide}>
        <SheetHeader>
          <SheetTitle>Editar Socio</SheetTitle>
          <SheetDescription>Modifica la información del socio:</SheetDescription>
        </SheetHeader>
        <EditSocioForm socio={socio} onSuccess={onClose} />
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

