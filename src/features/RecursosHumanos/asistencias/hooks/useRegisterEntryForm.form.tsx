"use client";

import { showToast } from "@/core/shared/helpers/CustomToast";
import { useForm } from "@tanstack/react-form";
import { createAsistenciaSchema } from "../schemas/createAsistenciaSchema.schema";
import { createAsistenciaAction } from "../server/actions/createAsistenciaAction.action";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "@/core/shared/helpers/localStorage.helper";

export const useRegisterEntryForm = () => {
  const form = useForm({
    defaultValues: {
      email: getLocalStorageItem("correo", undefined) ?? "",
      tipo: "Entrada",
    },
    validators: {
      onSubmit: createAsistenciaSchema,
    },
    onSubmit: async ({ value }) => {
      //obtener el correo si es que ya esta en el localStorage
      setLocalStorageItem("correo", value.email);

      const args = {
        correo: value.email,
        tipo: value.tipo as "Entrada" | "Salida",
        fecha: new Date(),
      };
      const result = await createAsistenciaAction(args);
      if (result && !result.ok) {
        showToast({
          title: `La ${value.tipo} no se pudo registrar`,
          description: "Intenta de nuevo mas tarde!",
          type: "error",
        });
        value.email = "";
        return;
      }

      showToast({
        title: `${value.tipo} Registrada satisfactoriamente`,
        description: "Que tengas Excelente dia!",
        type: "success",
      });
      //resetear valores
      value.email = "";
    },
  });
  return form;
};
