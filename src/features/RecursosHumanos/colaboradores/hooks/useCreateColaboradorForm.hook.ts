"use client";
import { useForm } from "@tanstack/react-form";
import { createColaboradorSchemaUI } from "../schemas/createColaboradorSchemaUI";
import { useCreateColaborador } from "./useCreateColaborador.hook";
import { ColaboradorEstado } from "../types/ColaboradorEstado.enum";

export const useCreateColaboradorForm = (onSuccess?: () => void) => {
  const createColaboradorMutation = useCreateColaborador();

  const form = useForm({
    defaultValues: {
      name: "",
      correo: "",
      puesto: "",
      status: ColaboradorEstado.CONTRATADO as ColaboradorEstado,
      imss: true,
      socioId: "__none__",
      banco: "",
      clabe: "",
      sueldo: "",
      activos: [] as string[],
    },
    validators: {
      onSubmit: createColaboradorSchemaUI,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("name", value.name);
      formData.append("correo", value.correo);
      formData.append("puesto", value.puesto);
      formData.append("status", value.status);
      formData.append("imss", String(value.imss));
      formData.append(
        "socioId",
        value.socioId === "__none__" ? "" : value.socioId
      );
      formData.append("banco", value.banco);
      formData.append("clabe", value.clabe);
      formData.append("sueldo", value.sueldo);
      formData.append("activos", JSON.stringify(value.activos || []));

      await createColaboradorMutation.mutateAsync(formData);
      onSuccess?.();
    },
  });

  return form;
};
