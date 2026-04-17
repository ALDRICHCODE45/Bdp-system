import { useQuery } from "@tanstack/react-query";
import { getRegistroHoraHistorialAction } from "../server/actions/getRegistroHoraHistorialAction";

export const useGetRegistroHoraHistorial = (registroHoraId: string) => {
  return useQuery({
    queryKey: ["registro-hora-historial", registroHoraId],
    queryFn: async () => {
      const result = await getRegistroHoraHistorialAction(registroHoraId);
      if (!result.ok)
        throw new Error(result.error || "Error al obtener historial");
      return result.data;
    },
    enabled: !!registroHoraId,
  });
};
