"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { editRoleSchemaUI } from "../schemas/editRoleSchema";
import { showToast } from "@/core/shared/helpers/CustomToast";
import { updateRoleAction } from "../server/actions/updateRoleAction";

type RoleData = {
  id: string;
  name: string;
};

export const useEditRoleForm = (roleData: RoleData) => {
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      id: roleData.id,
      name: roleData.name,
    },
    validators: {
      onSubmit: editRoleSchemaUI,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("id", value.id);
      formData.append("name", value.name);

      const result = await updateRoleAction(formData);

      if (!result.ok) {
        showToast({
          type: "error",
          description: result.error || "Error al actualizar rol",
          title: "Error",
        });
        throw new Error(result.error || "Error al actualizar rol");
      }

      // Invalidar la query del rol para que se refresque con los nuevos datos
      await queryClient.invalidateQueries({
        queryKey: ["role", value.id],
      });

      // Invalidar y refetchear queries de lista de roles para asegurar datos actualizados
      await queryClient.invalidateQueries({
        queryKey: ["roles"],
      });

      // Forzar refetch inmediato de la query de roles para actualizar componentes activos
      await queryClient.refetchQueries({
        queryKey: ["roles"],
      });

      showToast({
        type: "success",
        description: "Operación Exitosa",
        title: "Rol editado correctamente",
      });
    },
  });

  return form;
};
