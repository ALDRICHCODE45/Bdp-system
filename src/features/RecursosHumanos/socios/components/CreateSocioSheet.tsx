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
import { CreateSocioForm } from "./forms/CreateSocioForm";

interface CreateSocioSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSocioSheet({
  isOpen,
  onClose,
}: CreateSocioSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide}>
        <SheetHeader>
          <SheetTitle>Agregar Socio</SheetTitle>
          <SheetDescription>Ingresa la información del socio responsable:</SheetDescription>
        </SheetHeader>
        <CreateSocioForm onSuccess={onClose} />
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

