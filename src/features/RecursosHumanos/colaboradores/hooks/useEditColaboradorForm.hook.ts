"use client";
import { useForm } from "@tanstack/react-form";
import { updateColaboradorSchemaUI } from "../schemas/updateColaboradorSchemaUI";
import { useEditColaborador } from "./useEditColaborador.hook";
import { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import { ColaboradorEstado } from "../types/ColaboradorEstado.enum";

export const useEditColaboradorForm = (
  colaborador: ColaboradorDto,
  onSuccess?: () => void
) => {
  const editColaboradorMutation = useEditColaborador();

  const form = useForm({
    defaultValues: {
      id: colaborador.id,
      name: colaborador.name,
      correo: colaborador.correo,
      puesto: colaborador.puesto,
      status: colaborador.status as unknown as ColaboradorEstado,
      imss: colaborador.imss,
      socioId: colaborador.socioId || "__none__",
      banco: colaborador.banco,
      clabe: colaborador.clabe,
      sueldo: colaborador.sueldo,
      activos: colaborador.activos || [],
    },
    validators: {
      onSubmit: updateColaboradorSchemaUI,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("id", value.id);
      formData.append("name", value.name);
      formData.append("correo", value.correo);
      formData.append("puesto", value.puesto);
      formData.append("status", value.status);
      formData.append("imss", String(value.imss));
      formData.append("socioId", value.socioId === "__none__" ? "" : value.socioId);
      formData.append("banco", value.banco);
      formData.append("clabe", value.clabe);
      formData.append("sueldo", value.sueldo);
      formData.append("activos", JSON.stringify(value.activos || []));

      await editColaboradorMutation.mutateAsync(formData);
      onSuccess?.();
    },
  });

  return form;
};

