"use client";

import { useQuery } from "@tanstack/react-query";
import { getRolesAction } from "@/features/sistema/config/roles/server/actions/getRolesAction";

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const result = await getRolesAction();
      if (!result.ok || !result.data) {
        throw new Error(result.error || "Error al cargar roles");
      }
      return result.data;
    },
  });
};

