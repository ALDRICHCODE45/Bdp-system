"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { CreateFacturaForm } from "./forms/CreateFacturaForm";

interface CreateFacturaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isCapturador?: boolean;
}

export function CreateFacturaSheet({
  isOpen,
  onClose,
  isCapturador = false,
}: CreateFacturaSheetProps) {
  const isMobile = useIsMobile();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="ml-0 rounded-2xl overflow-y-auto p-0 w-full sm:max-w-2xl"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 border-b">
          <p className="text-xs text-muted-foreground font-medium mb-1">
            Nueva factura
          </p>
          <SheetTitle className="text-lg font-semibold">
            Agregar factura
          </SheetTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Completá los datos del CFDI para registrar la factura.
          </p>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="px-6 py-4">
          <CreateFacturaForm onSuccess={onClose} isCapturador={isCapturador} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
