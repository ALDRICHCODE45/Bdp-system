"use client";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { createUserSchemaUI } from "../schemas/createUserSchema";
import { showToast } from "@/core/shared/helpers/CustomToast";
import { createUserAction } from "../server/actions/createUserAction";

export const useCreateUserForm = () => {
  const queryClient = useQueryClient();

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
      const formData = new FormData();
      formData.append("name", value.nombre);
      formData.append("email", value.email);
      formData.append("password", value.password);
      formData.append("roles", JSON.stringify(value.roles));

      const result = await createUserAction(formData);

      if (!result.ok) {
        showToast({
          type: "error",
          description: result.error || "Error al crear usuario",
          title: "Error",
        });
        throw new Error(result.error || "Error al crear usuario");
      }

      // Invalidar la query de lista para que el usuario nuevo aparezca
      // inmediatamente en la tabla sin refrescar manualmente
      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      showToast({
        type: "success",
        description: "El usuario ahora puede ingresar al sistema",
        title: "Usuario creado correctamente",
      });
    },
  });

  return form;
};
