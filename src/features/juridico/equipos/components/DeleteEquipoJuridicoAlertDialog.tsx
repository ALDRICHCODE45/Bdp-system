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
import { Input } from "@/core/shared/ui/input";
import { useState } from "react";

interface DeleteEquipoJuridicoAlertDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  equipoNombre: string;
  isLoading: boolean;
}

export function DeleteEquipoJuridicoAlertDialog({
  isOpen,
  onOpenChange,
  onConfirmDelete,
  equipoNombre,
  isLoading,
}: DeleteEquipoJuridicoAlertDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const isMatch = inputValue.trim() === equipoNombre;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro de que deseas eliminar este equipo jurídico?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción <b>no se puede deshacer</b>. Para confirmar, por favor
            escribe <b>{equipoNombre}</b> debajo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-3">
          <Input
            autoFocus
            placeholder="Escribe el nombre del equipo"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          {!isMatch && inputValue.length > 0 && (
            <span className="text-xs text-red-500 mt-1 block">
              El nombre del equipo no coincide.
            </span>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmDelete}
            disabled={!isMatch || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
