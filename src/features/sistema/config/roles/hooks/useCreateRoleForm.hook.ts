"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { createRoleSchemaUI } from "../schemas/createRoleSchema";
import { showToast } from "@/core/shared/helpers/CustomToast";
import { createRoleAction } from "../server/actions/createRoleAction";

export const useCreateRoleForm = () => {
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: createRoleSchemaUI,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("name", value.name);

      const result = await createRoleAction(formData);

      if (!result.ok) {
        showToast({
          type: "error",
          description: result.error || "Error al crear rol",
          title: "Error",
        });
        throw new Error(result.error || "Error al crear rol");
      }

      await queryClient.invalidateQueries({
        queryKey: ["roles"],
      });

      showToast({
        type: "success",
        description: "El rol ahora está disponible en el sistema",
        title: "Rol creado correctamente",
      });
    },
  });

  return form;
};
