"use client";
import { useForm } from "@tanstack/react-form";
import { createSocioSchemaUI } from "../schemas/createSocioSchemaUI";
import { useCreateSocio } from "./useCreateSocio.hook";

export const useCreateSocioForm = (onSuccess?: () => void) => {
  const createSocioMutation = useCreateSocio();

  const form = useForm({
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      activo: true,
      fechaIngreso: new Date().toISOString().split("T")[0],
      departamento: "",
      notas: "",
    },
    validators: {
      onSubmit: createSocioSchemaUI,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("nombre", value.nombre);
      formData.append("email", value.email);
      formData.append("telefono", value.telefono || "");
      formData.append("activo", String(value.activo));
      formData.append("fechaIngreso", value.fechaIngreso);
      formData.append("departamento", value.departamento || "");
      formData.append("notas", value.notas || "");

      await createSocioMutation.mutateAsync(formData);
      onSuccess?.();
    },
  });

  return form;
};

