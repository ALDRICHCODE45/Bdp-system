"use client";

import { useQuery } from "@tanstack/react-query";
import { getRolesAction } from "@/features/sistema/config/roles/server/actions/getRolesAction";

// Hook para obtener roles
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

/**
 * ¿Cómo invalidar esta query desde otra página?
 *
 * Debes usar el hook useQueryClient de React Query y llamar a invalidateQueries con la misma queryKey.
 *
 * Ejemplo:
 *
 * import { useQueryClient } from "@tanstack/react-query";
 *
 * export function MiComponente() {
 *   const queryClient = useQueryClient();
 *
 *   const handleActualizarRoles = () => {
 *     // Esto invalidará la cache de la query de roles y provocará que se vuelva a fetchear
 *     queryClient.invalidateQueries({ queryKey: ["roles"] });
 *   };
 *
 *   return (
 *     <button onClick={handleActualizarRoles}>
 *       Actualizar roles
 *     </button>
 *   );
 * }
 *
 * Así puedes invalidar la query de roles en cualquier página/componente.
 */
