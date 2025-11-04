"use client";
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
import { useIsMobile } from "@/core/shared/hooks/use-mobile";

interface CreateUserSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add";
}

export function CreateUserSheet({
  isOpen,
  mode,
  onClose,
}: CreateUserSheetProps) {
  const isMobile = useIsMobile();

  const sheetSide = isMobile ? "bottom" : "right";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide}>
        <SheetHeader>
          <SheetTitle>Agregar Usuario</SheetTitle>
          <SheetDescription>Ingresa los siguientes campos:</SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-name">Nombre</Label>
            <Input id="sheet-demo-name" defaultValue="Aldrich" />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-username">Email</Label>
            <Input
              id="sheet-demo-username"
              defaultValue="@email.com"
              type="email"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="user-roles">Roles</Label>
            <Input id="user-roles" defaultValue="Admin" type="text" />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">Guardar Cambios</Button>
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
