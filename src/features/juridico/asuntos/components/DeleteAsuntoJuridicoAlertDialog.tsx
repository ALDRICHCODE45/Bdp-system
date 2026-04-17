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

interface DeleteAsuntoJuridicoAlertDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmClose: () => void;
  asuntoNombre: string;
  isLoading: boolean;
}

export function DeleteAsuntoJuridicoAlertDialog({
  isOpen,
  onOpenChange,
  onConfirmClose,
  asuntoNombre,
  isLoading,
}: DeleteAsuntoJuridicoAlertDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const isMatch = inputValue.trim() === asuntoNombre;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro de que deseas cerrar este asunto jurídico?
          </AlertDialogTitle>
          <AlertDialogDescription>
            El asunto pasará al estado <b>Cerrado</b> y no podrá registrarse
            horas en él. Para confirmar, escribe <b>{asuntoNombre}</b> debajo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-3">
          <Input
            autoFocus
            placeholder="Escribe el nombre del asunto"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          {!isMatch && inputValue.length > 0 && (
            <span className="text-xs text-red-500 mt-1 block">
              El nombre del asunto no coincide.
            </span>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmClose}
            disabled={!isMatch || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Cerrando..." : "Cerrar Asunto"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
