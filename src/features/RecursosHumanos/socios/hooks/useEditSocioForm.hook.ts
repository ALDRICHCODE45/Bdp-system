"use client";
import { useForm } from "@tanstack/react-form";
import { updateSocioSchemaUI } from "../schemas/updateSocioSchemaUI";
import { useEditSocio } from "./useEditSocio.hook";
import { SocioDto } from "../server/dtos/SocioDto.dto";

export const useEditSocioForm = (socio: SocioDto, onSuccess?: () => void) => {
  const editSocioMutation = useEditSocio();

  const form = useForm({
    defaultValues: {
      id: socio.id,
      nombre: socio.nombre,
      email: socio.email,
      telefono: socio.telefono || "",
      activo: socio.activo,
      fechaIngreso: new Date(socio.fechaIngreso).toISOString().split("T")[0],
      departamento: socio.departamento || "",
      notas: socio.notas || "",
    },
    validators: {
      onSubmit: updateSocioSchemaUI,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("id", value.id);
      formData.append("nombre", value.nombre);
      formData.append("email", value.email);
      formData.append("telefono", value.telefono || "");
      formData.append("activo", String(value.activo));
      formData.append("fechaIngreso", value.fechaIngreso);
      formData.append("departamento", value.departamento || "");
      formData.append("notas", value.notas || "");

      await editSocioMutation.mutateAsync(formData);
      onSuccess?.();
    },
  });

  return form;
};

