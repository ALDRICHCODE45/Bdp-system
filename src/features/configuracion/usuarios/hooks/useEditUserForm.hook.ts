"use client";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { editUserSchemaUI } from "../schemas/editUserSchema";
import { showToast } from "@/core/shared/helpers/CustomToast";
import { updateUserAction } from "../server/actions/updateUserAction";

type UserData = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  isActive: boolean;
};

export const useEditUserForm = (userData: UserData) => {
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      id: userData.id,
      email: userData.email,
      nombre: userData.name,
      password: "", // Password opcional - dejar vacío por defecto
      roles: userData.roles,
      isActive: userData.isActive,
    },
    validators: {
      onSubmit: editUserSchemaUI,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("id", value.id);
      formData.append("name", value.nombre);
      formData.append("email", value.email);
      // Solo enviar password si se proporcionó uno nuevo
      if (value.password && value.password.length > 0) {
        formData.append("password", value.password);
      }
      formData.append("roles", JSON.stringify(value.roles));
      formData.append("isActive", value.isActive.toString());

      const result = await updateUserAction(formData);

      if (!result.ok) {
        showToast({
          type: "error",
          description: result.error || "Error al actualizar usuario",
          title: "Error",
        });
        throw new Error(result.error || "Error al actualizar usuario");
      }

      // Invalidar la query del usuario para que se refresque con los nuevos datos
      await queryClient.invalidateQueries({
        queryKey: ["user", value.id],
      });

      showToast({
        type: "success",
        description: "Operación Exitosa",
        title: "Usuario editado correctamente",
      });
    },
  });

  return form;
};
