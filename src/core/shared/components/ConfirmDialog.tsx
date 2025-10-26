import { Button } from "@/core/shared/ui/button";
import { ReactElement, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/core/shared/ui/alert-dialog";

interface ConfirmDialogProps {
  title: string;
  description: string;
  action: () => void | Promise<void>;
  trigger?: ReactElement;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onOpenChange?: (open: boolean) => void;
}

export const ConfirmDialog = ({
  action,
  description,
  title,
  trigger,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "destructive",
  onOpenChange,
}: ConfirmDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await action();
      setOpen(false); // Cerrar el diálogo después de ejecutar la acción
    } catch (error) {
      console.error("Error en la acción de confirmación:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      ) : (
        <AlertDialogTrigger asChild>
          <Button variant="outline">{title}</Button>
        </AlertDialogTrigger>
      )}

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>

          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Procesando..." : confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
