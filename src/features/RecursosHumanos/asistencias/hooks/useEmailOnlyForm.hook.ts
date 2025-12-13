"use client";

import { showToast } from "@/core/shared/helpers/CustomToast";
import { useForm } from "@tanstack/react-form";
import { setLocalStorageItem } from "@/core/shared/helpers/localStorage.helper";
import { createAsistenciaAction } from "../server/actions/createAsistenciaAction.action";
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
      setLocalStorageItem("correo", value.email);

      const args = {
        correo: value.email,
        tipo,
        fecha: new Date(),
      };

      const result = await createAsistenciaAction(args);

      if (result && !result.ok) {
        showToast({
          title: `La ${tipo} no se pudo registrar`,
          description: "Intenta de nuevo mas tarde!",
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
    },
  });

  return form;
};
