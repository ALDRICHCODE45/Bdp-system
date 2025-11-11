"use client";
import { useForm } from "@tanstack/react-form";
import { createEntradaSalidaSchemaUI } from "../schemas/createEntradaSalidaSchemaUI";
import { useCreateEntradaSalida } from "./useCreateEntradaSalida.hook";

export const useCreateEntradaSalidaForm = (onSuccess?: () => void) => {
  const createEntradaSalidaMutation = useCreateEntradaSalida();

  // Obtener fecha y hora actuales para valores por defecto
  const now = new Date();
  const fechaActual = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const horaActual = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const form = useForm({
    defaultValues: {
      visitante: "",
      destinatario: "",
      motivo: "",
      telefono: "",
      correspondencia: "",
      fecha: fechaActual,
      hora_entrada: horaActual,
      hora_salida: "",
    },
    validators: {
      onSubmit: createEntradaSalidaSchemaUI,
    },
    onSubmit: async ({ value }) => {
      // Combinar fecha con hora_entrada
      const [entradaHours, entradaMinutes] = value.hora_entrada.split(":").map(Number);
      const fechaHoraEntrada = new Date(value.fecha);
      fechaHoraEntrada.setHours(entradaHours, entradaMinutes, 0, 0);

      // Crear FormData
      const formData = new FormData();
      formData.append("visitante", value.visitante);
      formData.append("destinatario", value.destinatario);
      formData.append("motivo", value.motivo);
      formData.append("telefono", value.telefono || "");
      formData.append("correspondencia", value.correspondencia || "");
      formData.append("fecha", fechaHoraEntrada.toISOString());
      formData.append("hora_entrada", fechaHoraEntrada.toISOString());
      
      // Solo agregar hora_salida si está presente y no está vacío
      if (value.hora_salida && value.hora_salida !== "") {
        const [salidaHours, salidaMinutes] = value.hora_salida.split(":").map(Number);
        const fechaHoraSalida = new Date(value.fecha);
        fechaHoraSalida.setHours(salidaHours, salidaMinutes, 0, 0);
        formData.append("hora_salida", fechaHoraSalida.toISOString());
      }

      await createEntradaSalidaMutation.mutateAsync(formData);
      onSuccess?.();
    },
  });

  return form;
};

