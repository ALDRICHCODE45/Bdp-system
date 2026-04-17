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

interface DeleteClienteJuridicoAlertDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  clienteNombre: string;
  isLoading: boolean;
}

export function DeleteClienteJuridicoAlertDialog({
  isOpen,
  onOpenChange,
  onConfirmDelete,
  clienteNombre,
  isLoading,
}: DeleteClienteJuridicoAlertDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const isMatch = inputValue.trim() === clienteNombre;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro de que deseas eliminar este cliente jurídico?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción <b>no se puede deshacer</b>. Para confirmar, por favor
            escribe <b>{clienteNombre}</b> debajo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-3">
          <Input
            autoFocus
            placeholder="Escribe el nombre del cliente"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          {!isMatch && inputValue.length > 0 && (
            <span className="text-xs text-red-500 mt-1 block">
              El nombre del cliente no coincide.
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
