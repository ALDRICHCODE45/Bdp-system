"use client";
import { useQuery } from "@tanstack/react-query";
import { getPaginatedUsersAction } from "@/features/sistema/usuarios/server/actions/getPaginatedUsersAction";

/**
 * Devuelve todos los usuarios del sistema sin paginación visible.
 * Pensado para selects/filtros donde necesitamos la lista completa.
 * Pagesize = 200 es suficiente para cualquier empresa razonable.
 */
export const useAllUsers = () => {
  return useQuery({
    queryKey: ["users-all"],
    queryFn: async () => {
      const result = await getPaginatedUsersAction({ page: 1, pageSize: 200 });
      if (!result.ok) throw new Error(result.error ?? "Error al cargar usuarios");
      return result.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos — los usuarios no cambian seguido
  });
};
