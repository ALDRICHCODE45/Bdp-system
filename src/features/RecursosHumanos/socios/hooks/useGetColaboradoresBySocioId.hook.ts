import { useQuery } from "@tanstack/react-query";
import { getAllColaboradoresBySocioId } from "../server/actions/getAllColaboradoresBySocioId.action";

export const useGetColaboradoresBySocioId = (socioId: string) => {
  return useQuery({
    queryKey: ["colaboradoresBySocioId"],
    queryFn: async () => {
      const result = await getAllColaboradoresBySocioId(socioId);
      if (!result.ok || !result.data) {
        throw new Error(
          result.error || "Error al cargar colaboradores de un socio",
        );
      }
      return result.data;
    },
  });
};
