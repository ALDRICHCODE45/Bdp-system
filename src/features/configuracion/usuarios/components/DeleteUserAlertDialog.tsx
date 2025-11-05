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

interface DeleteUserAlertDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  // en la integración real esto se recibiría como prop
  // por ahora es solo para UI de prueba
  userNameToDelete?: string;
  onConfirmDelete?: () => void; // opcional para completar el flujo
}

const USERNAME_TEST = "juan.perez"; // Variable de prueba (el nombre a confirmar)

export const DeleteUserAlertDialog = ({
  isOpen,
  onOpenChange,
  userNameToDelete = USERNAME_TEST,
  onConfirmDelete,
}: DeleteUserAlertDialogProps) => {
  const [inputValue, setInputValue] = useState("");

  const isMatch = inputValue.trim() === userNameToDelete;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que deseas eliminar este usuario?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción <b>no se puede deshacer</b>. Para confirmar, por favor
            escribe <b>{userNameToDelete}</b> debajo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-3">
          <Input
            autoFocus
            placeholder="Escribe el nombre de usuario"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            data-testid="delete-user-confirm-input"
          />
          {!isMatch && inputValue.length > 0 && (
            <span className="text-xs text-red-500 mt-1 block">
              El nombre no coincide.
            </span>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button asChild variant={"destructive"}>
            <AlertDialogAction
              disabled={!isMatch}
              onClick={onConfirmDelete}
              data-testid="delete-user-confirm-btn"
            >
              Eliminar
            </AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
