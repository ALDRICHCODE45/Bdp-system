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
      // Datos personales
      fechaIngreso: colaborador.fechaIngreso
        ? colaborador.fechaIngreso.slice(0, 10)
        : "",
      genero: colaborador.genero || "",
      fechaNacimiento: colaborador.fechaNacimiento
        ? colaborador.fechaNacimiento.slice(0, 10)
        : "",
      nacionalidad: colaborador.nacionalidad || "",
      estadoCivil: colaborador.estadoCivil || "",
      tipoSangre: colaborador.tipoSangre || "",
      // Contacto y dirección
      direccion: colaborador.direccion || "",
      telefono: colaborador.telefono || "",
      // Datos fiscales
      rfc: colaborador.rfc || "",
      curp: colaborador.curp || "",
      // Académicos y laborales previos
      ultimoGradoEstudios: colaborador.ultimoGradoEstudios || "",
      escuela: colaborador.escuela || "",
      ultimoTrabajo: colaborador.ultimoTrabajo || "",
      // Referencias personales
      nombreReferenciaPersonal: colaborador.nombreReferenciaPersonal || "",
      telefonoReferenciaPersonal: colaborador.telefonoReferenciaPersonal || "",
      parentescoReferenciaPersonal:
        colaborador.parentescoReferenciaPersonal || "",
      // Referencias laborales
      nombreReferenciaLaboral: colaborador.nombreReferenciaLaboral || "",
      telefonoReferenciaLaboral: colaborador.telefonoReferenciaLaboral || "",
      banco: colaborador.banco,
      clabe: colaborador.clabe,
      sueldo: colaborador.sueldo,
      activos: colaborador.activos || [],
    },
    validators: {
      // Cast necesario porque Zod no implementa completamente StandardSchemaV1
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSubmit: updateColaboradorSchemaUI as any,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("id", value.id);
      formData.append("name", value.name);
      formData.append("correo", value.correo);
      formData.append("puesto", value.puesto);
      formData.append("status", value.status);
      formData.append("imss", String(value.imss));
      formData.append(
        "socioId",
        value.socioId === "__none__" ? "" : value.socioId
      );
      // Datos personales
      formData.append("fechaIngreso", value.fechaIngreso);
      formData.append("genero", value.genero);
      formData.append("fechaNacimiento", value.fechaNacimiento);
      formData.append("nacionalidad", value.nacionalidad || "");
      formData.append("estadoCivil", value.estadoCivil || "");
      formData.append("tipoSangre", value.tipoSangre || "");
      // Contacto y dirección
      formData.append("direccion", value.direccion);
      formData.append("telefono", value.telefono);
      // Datos fiscales
      formData.append("rfc", value.rfc || "");
      formData.append("curp", value.curp || "");
      // Académicos y laborales previos
      formData.append("ultimoGradoEstudios", value.ultimoGradoEstudios || "");
      formData.append("escuela", value.escuela || "");
      formData.append("ultimoTrabajo", value.ultimoTrabajo || "");
      // Referencias personales
      formData.append(
        "nombreReferenciaPersonal",
        value.nombreReferenciaPersonal || ""
      );
      formData.append(
        "telefonoReferenciaPersonal",
        value.telefonoReferenciaPersonal || ""
      );
      formData.append(
        "parentescoReferenciaPersonal",
        value.parentescoReferenciaPersonal || ""
      );
      // Referencias laborales
      formData.append(
        "nombreReferenciaLaboral",
        value.nombreReferenciaLaboral || ""
      );
      formData.append(
        "telefonoReferenciaLaboral",
        value.telefonoReferenciaLaboral || ""
      );
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
