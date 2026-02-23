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
import { Field, FieldLabel, FieldError } from "@/core/shared/ui/field";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EntradasSalidasDTO } from "../server/dtos/EntradasSalidasDto.dto";

interface RegistrarSalidaDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  entradaSalida: EntradasSalidasDTO;
  onConfirm: (horaSalidaISO: string) => void;
  isLoading?: boolean;
}

export const RegistrarSalidaDialog = ({
  isOpen,
  onOpenChange,
  entradaSalida,
  onConfirm,
  isLoading = false,
}: RegistrarSalidaDialogProps) => {
  const [horaSalida, setHoraSalida] = useState("");
  const [error, setError] = useState("");

  // Hora actual disponible si se necesita como default

  // Formatear hora de entrada para mostrar
  const horaEntradaDate = new Date(entradaSalida.hora_entrada);
  const horaEntradaFormateada = format(horaEntradaDate, "HH:mm", {
    locale: es,
  });

  const handleConfirm = () => {
    // Validar que la hora de salida esté en formato HH:mm
    const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!horaRegex.test(horaSalida)) {
      setError("La hora de salida debe estar en formato HH:mm");
      return;
    }

    // Combinar fecha de entrada con hora de salida
    const [salidaHours, salidaMinutes] = horaSalida.split(":").map(Number);
    const fechaEntrada = new Date(entradaSalida.fecha);
    const fechaHoraEntrada = new Date(entradaSalida.hora_entrada);

    // Crear fecha/hora de salida usando la misma fecha que la entrada
    const fechaHoraSalida = new Date(fechaEntrada);
    fechaHoraSalida.setHours(salidaHours, salidaMinutes, 0, 0);

    // Si la hora de salida es menor o igual a la hora de entrada, asumimos que es del día siguiente
    if (fechaHoraSalida <= fechaHoraEntrada) {
      fechaHoraSalida.setDate(fechaHoraSalida.getDate() + 1);
    }

    // Validar que hora_salida sea posterior a hora_entrada
    if (fechaHoraSalida <= fechaHoraEntrada) {
      setError("La hora de salida debe ser posterior a la hora de entrada");
      return;
    }

    setError("");
    // Pasar la fecha/hora completa como ISO string
    onConfirm(fechaHoraSalida.toISOString());
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setHoraSalida("");
      setError("");
    }
    onOpenChange(open);
  };

  // Inicializar con hora actual cuando se abre el diálogo
  React.useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const hora = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      setHoraSalida(hora);
      setError("");
    }
  }, [isOpen]);

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Registrar Salida</AlertDialogTitle>
          <AlertDialogDescription>
            Registra la hora de salida para el visitante{" "}
            <b>{entradaSalida.visitante}</b>. Hora de entrada:{" "}
            <b>{horaEntradaFormateada}</b>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-3">
          <Field>
            <FieldLabel htmlFor="hora_salida">Hora de Salida</FieldLabel>
            <Input
              id="hora_salida"
              type="time"
              value={horaSalida}
              onChange={(e) => {
                setHoraSalida(e.target.value);
                setError("");
              }}
              autoFocus
              aria-invalid={!!error}
            />
            {error && <FieldError errors={[{ message: error }]} />}
          </Field>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <Button asChild variant="default">
            <AlertDialogAction
              disabled={isLoading || !horaSalida}
              onClick={handleConfirm}
            >
              {isLoading ? "Registrando..." : "Registrar Salida"}
            </AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
