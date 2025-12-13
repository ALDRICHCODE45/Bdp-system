"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/shared/ui/dialog";
import { Button } from "@/core/shared/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type RegistroState = "idle" | "loading" | "success" | "error";
type TipoAsistencia = "Entrada" | "Salida";

interface RegistroSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: RegistroState;
  tipo: TipoAsistencia;
  email: string;
  onRetry?: () => void;
}

export const RegistroSuccessDialog = ({
  open,
  onOpenChange,
  state,
  tipo,
  email,
  onRetry,
}: RegistroSuccessDialogProps) => {
  const isLoading = state === "loading";
  const isSuccess = state === "success";
  const isError = state === "error";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!isLoading}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {isLoading && (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            )}
            {isSuccess && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {isError && (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
          </div>
          <DialogTitle className="text-center">
            {isLoading && `Registrando ${tipo}...`}
            {isSuccess && `${tipo} Registrada`}
            {isError && "Error al registrar"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isLoading && (
              <>Procesando registro para <strong>{email}</strong></>
            )}
            {isSuccess && (
              <>
                Tu {tipo.toLowerCase()} ha sido registrada satisfactoriamente.
                <br />
                <span className="text-xs text-muted-foreground mt-2 block">
                  {email}
                </span>
              </>
            )}
            {isError && (
              <>
                No se pudo registrar tu {tipo.toLowerCase()}.
                <br />
                Intenta de nuevo mas tarde.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          {isSuccess && (
            <Button onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          )}
          {isError && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
              {onRetry && (
                <Button onClick={onRetry}>
                  Reintentar
                </Button>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
