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
      // Datos personales
      fechaIngreso: "",
      genero: "",
      fechaNacimiento: "",
      nacionalidad: "",
      estadoCivil: "",
      tipoSangre: "",
      // Contacto y dirección
      direccion: "",
      telefono: "",
      // Datos fiscales
      rfc: "",
      curp: "",
      // Académicos y laborales previos
      ultimoGradoEstudios: "",
      escuela: "",
      ultimoTrabajo: "",
      // Referencias personales
      nombreReferenciaPersonal: "",
      telefonoReferenciaPersonal: "",
      parentescoReferenciaPersonal: "",
      // Referencias laborales
      nombreReferenciaLaboral: "",
      telefonoReferenciaLaboral: "",
      // Perfil extendido (rh-colaboradores-completo · P0)
      departamento: "",
      nivel: "",
      modalidad: "",
      tipoContrato: "",
      lugarTrabajo: "",
      horario: "",
      fechaSalida: "",
      nombrePreferido: "",
      emailPersonal: "",
      bio: "",
      banco: "",
      clabe: "",
      sueldo: "",
      activos: [] as string[],
    },
    validators: {
      // Cast necesario porque Zod no implementa completamente StandardSchemaV1
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSubmit: createColaboradorSchemaUI as any,
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
      // Perfil extendido (rh-colaboradores-completo · P0)
      formData.append("departamento", value.departamento || "");
      formData.append("nivel", value.nivel || "");
      formData.append("modalidad", value.modalidad || "");
      formData.append("tipoContrato", value.tipoContrato || "");
      formData.append("lugarTrabajo", value.lugarTrabajo || "");
      formData.append("horario", value.horario || "");
      formData.append("fechaSalida", value.fechaSalida || "");
      formData.append("nombrePreferido", value.nombrePreferido || "");
      formData.append("emailPersonal", value.emailPersonal || "");
      formData.append("bio", value.bio || "");
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
