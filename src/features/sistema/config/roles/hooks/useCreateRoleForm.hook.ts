"use client";

import { useForm } from "@tanstack/react-form";
import { createRoleSchemaUI } from "../schemas/createRoleSchema";
import { showToast } from "@/core/shared/helpers/CustomToast";
import { createRoleAction } from "../server/actions/createRoleAction";
import { useRouter } from "next/navigation";

export const useCreateRoleForm = () => {
  const router = useRouter();

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

      showToast({
        type: "success",
        description: "El rol ahora está disponible en el sistema",
        title: "Rol creado correctamente",
      });

      router.refresh();

      console.log("Rol creado", {
        name: value.name,
      });
    },
  });

  return form;
};
