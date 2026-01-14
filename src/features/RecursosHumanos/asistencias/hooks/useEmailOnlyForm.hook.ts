"use client";

import { showToast } from "@/core/shared/helpers/CustomToast";
import { useForm } from "@tanstack/react-form";
import { setLocalStorageItem } from "@/core/shared/helpers/localStorage.helper";
import { createAsistenciaPublicAction } from "../server/actions/createAsistenciaPublicAction.action";
import z from "zod";

type TipoAsistencia = "Entrada" | "Salida";

const emailOnlySchema = z.object({
  email: z.string().email("Formato de correo no valido"),
});

interface UseEmailOnlyFormOptions {
  tipo: TipoAsistencia;
  onSuccess?: () => void;
}

export const useEmailOnlyForm = ({ tipo, onSuccess }: UseEmailOnlyFormOptions) => {
  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: emailOnlySchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setLocalStorageItem("correo", value.email);

        const args = {
          correo: value.email,
          tipo,
          fecha: new Date(),
        };

        const result = await createAsistenciaPublicAction(args);

        if (result && !result.ok) {
          showToast({
            title: `La ${tipo} no se pudo registrar`,
            description: result.message || "Intenta de nuevo mas tarde!",
            type: "error",
          });
          return;
        }

        showToast({
          title: `${tipo} Registrada satisfactoriamente`,
          description: "Que tengas Excelente dia!",
          type: "success",
        });

        onSuccess?.();
      } catch (error) {
        console.error("Error in email form:", error);
        showToast({
          title: "Error al registrar",
          description: "Error desconocido. Intenta de nuevo.",
          type: "error",
        });
      }
    },
  });

  return form;
};
