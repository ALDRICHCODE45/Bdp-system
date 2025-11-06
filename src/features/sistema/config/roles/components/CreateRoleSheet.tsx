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
import { CreateRoleForm } from "./forms/CreateRoleForm";

interface CreateRoleSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "add" | "edit";
}

export const CreateRoleSheet = ({ isOpen, onClose }: CreateRoleSheetProps) => {
  const isMobile = useIsMobile();

  const sheetSide = isMobile ? "bottom" : "right";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide}>
        <SheetHeader>
          <SheetTitle>Agregar Rol</SheetTitle>
          <SheetDescription>
            Complete el formulario para crear un nuevo rol en el sistema.
          </SheetDescription>
        </SheetHeader>
        <CreateRoleForm />
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
