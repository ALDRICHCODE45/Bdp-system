"use client";
import { useForm } from "@tanstack/react-form";
import { createEntradaSalidaSchemaUI } from "../schemas/createEntradaSalidaSchemaUI";
import { useUpdateEntradaSalida } from "./useUpdateEntradaSalida.hook";
import { EntradasSalidasDTO } from "../server/dtos/EntradasSalidasDto.dto";

export const useUpdateEntradaSalidaForm = (
  entradaSalida: EntradasSalidasDTO,
  onSuccess?: () => void
) => {
  const updateEntradaSalidaMutation = useUpdateEntradaSalida();

  // Convertir Date objects a formato de formulario
  const fecha = new Date(entradaSalida.fecha);
  const horaEntradaDate = new Date(entradaSalida.hora_entrada);
  
  // Extraer hora y minutos en formato HH:mm
  const horaEntrada = `${String(horaEntradaDate.getHours()).padStart(2, "0")}:${String(horaEntradaDate.getMinutes()).padStart(2, "0")}`;
  
  // Manejar hora_salida que puede ser null
  const horaSalida = entradaSalida.hora_salida
    ? `${String(new Date(entradaSalida.hora_salida).getHours()).padStart(2, "0")}:${String(new Date(entradaSalida.hora_salida).getMinutes()).padStart(2, "0")}`
    : "";

  const form = useForm({
    defaultValues: {
      visitante: entradaSalida.visitante,
      destinatario: entradaSalida.destinatario,
      motivo: entradaSalida.motivo,
      telefono: entradaSalida.telefono || "",
      correspondencia: entradaSalida.correspondencia || "",
      fecha: fecha,
      hora_entrada: horaEntrada,
      hora_salida: horaSalida,
    },
    validators: {
      onSubmit: createEntradaSalidaSchemaUI,
    },
    onSubmit: async ({ value }) => {
      // Combinar fecha con hora_entrada
      const [entradaHours, entradaMinutes] = value.hora_entrada.split(":").map(Number);
      const fechaHoraEntrada = new Date(value.fecha);
      fechaHoraEntrada.setHours(entradaHours, entradaMinutes, 0, 0);

      // Crear FormData - enviar todos los campos
      const formData = new FormData();
      formData.append("id", entradaSalida.id);
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
      } else {
        // Si hora_salida está vacía, enviar string vacío para indicar que debe ser null
        formData.append("hora_salida", "");
      }

      await updateEntradaSalidaMutation.mutateAsync(formData);
      onSuccess?.();
    },
  });

  return form;
};

