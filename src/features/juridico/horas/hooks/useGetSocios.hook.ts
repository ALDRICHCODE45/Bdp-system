import { useQuery } from "@tanstack/react-query";
import { getAllSociosAction } from "@/features/RecursosHumanos/socios/server/actions/getAllSociosAction";

export const useGetSocios = () => {
  return useQuery({
    queryKey: ["socios"],
    queryFn: async () => {
      const result = await getAllSociosAction();
      if (!result.ok || !result.data) {
        throw new Error(result.error ?? "Error al cargar socios");
      }
      return result.data;
    },
  });
};
