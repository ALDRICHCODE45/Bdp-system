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
import { Input } from "@/core/shared/ui/input";
import { useState } from "react";

interface DeleteEgresoAlertDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  egresoToDelete: string;
  isLoading: boolean;
}

export function DeleteEgresoAlertDialog({
  isOpen,
  onOpenChange,
  onConfirmDelete,
  egresoToDelete,
  isLoading,
}: DeleteEgresoAlertDialogProps) {
  const [inputValue, setInputValue] = useState("");

  const isMatch = inputValue.trim() === egresoToDelete;
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro de que deseas eliminar este egreso?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción <b>no se puede deshacer</b>. Para confirmar, por favor
            escribe <b>{egresoToDelete}</b> debajo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-3">
          <Input
            autoFocus
            placeholder="Escribe el concepto del egreso"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            data-testid="delete-egreso-confirm-input"
          />
          {!isMatch && inputValue.length > 0 && (
            <span className="text-xs text-red-500 mt-1 block">
              El concepto del egreso no coincide.
            </span>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
