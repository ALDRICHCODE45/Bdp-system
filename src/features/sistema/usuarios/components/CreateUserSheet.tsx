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
import { CreateUserForm } from "./forms/CreateUserForm";

interface CreateUserSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add";
}

export function CreateUserSheet({ isOpen, onClose }: CreateUserSheetProps) {
  const isMobile = useIsMobile();

  const sheetSide = isMobile ? "bottom" : "right";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide}>
        <SheetHeader>
          <SheetTitle>Agregar Usuario</SheetTitle>
          <SheetDescription>Ingresa los siguientes campos:</SheetDescription>
        </SheetHeader>
        <CreateUserForm />
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
