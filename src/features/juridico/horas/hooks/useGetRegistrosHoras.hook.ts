import { useQuery } from "@tanstack/react-query";
import { getRegistrosHorasAction } from "../server/actions/getRegistrosHorasAction";

export const useGetRegistrosHoras = () => {
  return useQuery({
    queryKey: ["registros-horas"],
    queryFn: async () => {
      const result = await getRegistrosHorasAction();
      if (!result.ok) throw new Error(result.error || "Error al obtener registros de horas");
      return result.data;
    },
  });
};
