"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/core/shared/ui/alert-dialog";

interface DeactivateTarifaAlertDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  tarifaLabel: string;
  isLoading: boolean;
}

export function DeactivateTarifaAlertDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  tarifaLabel,
  isLoading,
}: DeactivateTarifaAlertDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Desactivar esta tarifa?</AlertDialogTitle>
          <AlertDialogDescription>
            La tarifa <b>{tarifaLabel}</b> se marcará como inactiva. Los
            registros de horas existentes NO se modifican — conservan el{" "}
            <code>tarifaHora</code> que tenían al momento del registro. Para
            volver a usar esta combinación (abogado, asunto), crea una nueva
            tarifa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Desactivando..." : "Desactivar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
