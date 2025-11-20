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
import { EditFacturaForm } from "./forms/EditFacturaForm";
import { FacturaDto } from "../server/dtos/FacturaDto.dto";

interface EditFacturaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  factura: FacturaDto | null;
}

export function EditFacturaSheet({
  isOpen,
  onClose,
  factura,
}: EditFacturaSheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";

  if (!factura) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide}>
        <SheetHeader>
          <SheetTitle>Editar Factura</SheetTitle>
          <SheetDescription>
            Modifica la información de la factura:
          </SheetDescription>
        </SheetHeader>
        <div className="h-[80vh] overflow-y-auto">
          <EditFacturaForm factura={factura} onSuccess={onClose} />
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

