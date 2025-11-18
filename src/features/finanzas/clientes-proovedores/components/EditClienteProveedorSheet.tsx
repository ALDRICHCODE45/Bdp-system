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
import { EditClienteProveedorForm } from "./forms/EditClienteProveedorForm";
import { ClienteProveedorDto } from "../server/dtos/ClienteProveedorDto.dto";

interface EditClienteProveedorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  clienteProveedor: ClienteProveedorDto;
}

export function EditClienteProveedorSheet({
  isOpen,
  onClose,
  clienteProveedor,
}: EditClienteProveedorSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide}>
        <SheetHeader>
          <SheetTitle>Editar Cliente/Proveedor</SheetTitle>
          <SheetDescription>
            Modifica la información del cliente o proveedor:
          </SheetDescription>
        </SheetHeader>
        <div className="h-[80vh] overflow-y-auto">
          <EditClienteProveedorForm
            clienteProveedor={clienteProveedor}
            onSuccess={onClose}
          />
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

