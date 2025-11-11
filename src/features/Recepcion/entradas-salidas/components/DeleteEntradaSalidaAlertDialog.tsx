"use client";

import React, { useState } from "react";
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
import { Button } from "@/core/shared/ui/button";

interface DeleteEntradaSalidaAlertDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  entradaSalidaToDelete?: string;
  onConfirmDelete?: () => void;
  isLoading?: boolean;
}

export const DeleteEntradaSalidaAlertDialog = ({
  isOpen,
  onOpenChange,
  entradaSalidaToDelete,
  onConfirmDelete,
  isLoading = false,
}: DeleteEntradaSalidaAlertDialogProps) => {
  const [inputValue, setInputValue] = useState("");

  const isMatch = inputValue.trim() === entradaSalidaToDelete;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que deseas eliminar esta entrada/salida?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción <b>no se puede deshacer</b>. Para confirmar, por favor
            escribe <b>{entradaSalidaToDelete}</b> debajo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-3">
          <Input
            autoFocus
            placeholder="Escribe el nombre del visitante"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            data-testid="delete-entrada-salida-confirm-input"
          />
          {!isMatch && inputValue.length > 0 && (
            <span className="text-xs text-red-500 mt-1 block">
              El nombre no coincide.
            </span>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <Button asChild variant={"destructive"}>
            <AlertDialogAction
              disabled={!isMatch || isLoading}
              onClick={onConfirmDelete}
              data-testid="delete-entrada-salida-confirm-btn"
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

