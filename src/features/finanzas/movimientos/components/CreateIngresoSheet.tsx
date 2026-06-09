"use client";

import { Sheet, SheetContent, SheetTitle } from "@/core/shared/ui/sheet";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { cn } from "@/core/lib/utils";
import { MovimientoCreateForm } from "./MovimientoCreateForm";

interface CreateIngresoSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateIngresoSheet({ isOpen, onClose }: CreateIngresoSheetProps) {
  const isMobile = useIsMobile();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "ml-0 p-0 w-full sm:max-w-2xl flex flex-col overflow-hidden",
          isMobile ? "rounded-t-2xl max-h-[92dvh]" : "rounded-2xl h-full"
        )}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b shrink-0">
          <p className="text-xs text-muted-foreground font-medium mb-1">Nuevo movimiento</p>
          <SheetTitle className="text-lg font-semibold">Agregar ingreso</SheetTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Registrá un ingreso del estado de cuenta.
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <MovimientoCreateForm tipo="INGRESO" onSuccess={onClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
