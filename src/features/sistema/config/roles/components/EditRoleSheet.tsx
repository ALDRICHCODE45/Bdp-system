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
import { EditRoleForm } from "./forms/EditRoleForm";

interface EditRoleSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "add" | "edit";
  roleId: string;
}

export const EditRoleSheet = ({
  isOpen,
  onClose,
  roleId,
}: EditRoleSheetProps) => {
  const isMobile = useIsMobile();

  const sheetSide = isMobile ? "bottom" : "right";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide}>
        <SheetHeader>
          <SheetTitle>Editar Rol</SheetTitle>
          <SheetDescription>
            Modifique el nombre del rol según sea necesario.
          </SheetDescription>
        </SheetHeader>
        <EditRoleForm roleId={roleId} />
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

