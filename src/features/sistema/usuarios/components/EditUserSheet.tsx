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
import { EditUserForm } from "./forms/EditUserForm";

interface EditUserSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add";
  userId: string;
}

export function EditUserSheet({ isOpen, onClose, userId }: EditUserSheetProps) {
  const isMobile = useIsMobile();

  const sheetSide = isMobile ? "bottom" : "right";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide}>
        <SheetHeader>
          <SheetTitle>Editar Usuario</SheetTitle>
          <SheetDescription>
            Edita los campos que desees modificar:
          </SheetDescription>
        </SheetHeader>
        <EditUserForm userId={userId} />
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
