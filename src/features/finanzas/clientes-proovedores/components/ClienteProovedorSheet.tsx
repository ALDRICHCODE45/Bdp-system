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
import { Label } from "@/core/shared/ui/label";
import { Input } from "@/core/shared/ui/input";

interface ClienteProveedorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add";
}

export function ClienteProovedorSheet({
  isOpen,
  mode,
  onClose,
}: ClienteProveedorSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Agregar Cliente/Proovedor</SheetTitle>
          <SheetDescription>Ingresa los siguientes campos:</SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-name">Nombre</Label>
            <Input id="sheet-demo-name" defaultValue="BIMBO" />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-username">RFC</Label>
            <Input id="sheet-demo-username" defaultValue="2JKASD2JDH" />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
