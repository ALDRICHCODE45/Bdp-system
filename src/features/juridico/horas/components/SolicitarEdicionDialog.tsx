"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/shared/ui/dialog";
import { Button } from "@/core/shared/ui/button";
import { Label } from "@/core/shared/ui/label";
import { Textarea } from "@/core/shared/ui/textarea";
import { useSolicitarEdicion } from "../hooks/useSolicitarEdicion.hook";

interface SolicitarEdicionDialogProps {
  registroHoraId: string;
  semana: number;
  ano: number;
  isOpen: boolean;
  onClose: () => void;
}

export function SolicitarEdicionDialog({
  registroHoraId,
  semana,
  ano,
  isOpen,
  onClose,
}: SolicitarEdicionDialogProps) {
  const [justificacion, setJustificacion] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useSolicitarEdicion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (justificacion.trim().length < 10) {
      setError("La justificación debe tener al menos 10 caracteres");
      return;
    }

    try {
      await mutation.mutateAsync({ registroHoraId, justificacion });
      setJustificacion("");
      onClose();
    } catch {
      // Error handled by mutation onError (toast)
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setJustificacion("");
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Autorización de Edición</DialogTitle>
          <DialogDescription>
            El plazo de edición para la <strong>Sem {semana} - {ano}</strong> ha
            vencido. Ingresa una justificación para solicitar autorización al
            administrador.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="justificacion">
              Justificación <span className="text-red-500">*</span>
              <span className="text-xs text-muted-foreground ml-1">
                (mín 10 caracteres)
              </span>
            </Label>
            <Textarea
              id="justificacion"
              value={justificacion}
              onChange={(e) => {
                setJustificacion(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Explica por qué necesitas modificar este registro..."
              rows={4}
              maxLength={500}
              disabled={mutation.isPending}
            />
            <div className="flex justify-between">
              {error ? (
                <p className="text-xs text-red-500">{error}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {justificacion.length}/500
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
