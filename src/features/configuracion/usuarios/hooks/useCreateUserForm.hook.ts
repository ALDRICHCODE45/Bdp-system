"use client";
import { useForm } from "@tanstack/react-form";
import { createUserSchemaUI } from "../schemas/createUserSchema";
import { showToast } from "@/core/shared/helpers/CustomToast";
import { createUserAction } from "../server/actions/createUserAction";

export const useCreateUserForm = () => {
  const form = useForm({
    defaultValues: {
      email: "",
      nombre: "",
      password: "",
      roles: [] as string[],
    },
    validators: {
      onSubmit: createUserSchemaUI,
    },
    onSubmit: async ({ value }) => {
      showToast({
        type: "success",
        description: "El usuario ahora puede ingresar al sistema",
        title: "Usuario creado correctamente",
      });
      const formData = new FormData();
      formData.append("name", value.nombre);
      formData.append("email", value.email);
      formData.append("password", value.password);
      formData.append("roles", JSON.stringify(value.roles));

      await createUserAction(formData);

      console.log("Usuario creado", {
        email: value.email,
        password: value.password,
        nombre: value.nombre,
        roles: value.roles,
      });
    },
  });

  return form;
};
