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
import { CreateClienteProveedorForm } from "./forms/CreateClienteProveedorForm";

interface CreateClienteProveedorSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateClienteProveedorSheet({
  isOpen,
  onClose,
}: CreateClienteProveedorSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide}>
        <SheetHeader>
          <SheetTitle>Agregar Cliente/Proveedor</SheetTitle>
          <SheetDescription>
            Ingresa la información del cliente o proveedor:
          </SheetDescription>
        </SheetHeader>
        <div className="h-[80vh] overflow-y-auto">
          <CreateClienteProveedorForm onSuccess={onClose} />
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

