import { useQuery } from "@tanstack/react-query";
import { getAllColaboradoresAction } from "../server/actions/getAllColaboradoresAction";

export const useColaboradores = () => {
  return useQuery({
    queryKey: ["colaboradores"],
    queryFn: async () => {
      const result = await getAllColaboradoresAction();
      if (!result.ok || !result.data) {
        throw new Error(result.error || "Error al cargar colaboradores");
      }
      return result.data;
    },
  });
};
