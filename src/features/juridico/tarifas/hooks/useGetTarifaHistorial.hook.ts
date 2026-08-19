import { useQuery } from "@tanstack/react-query";
import { getTarifaHistorialAction } from "../server/actions/getTarifaHistorialAction";

export const useGetTarifaHistorial = (tarifaId: string, enabled = true) => {
  return useQuery({
    queryKey: ["tarifas-abogado-asunto", "historial", tarifaId],
    enabled: enabled && !!tarifaId,
    queryFn: async () => {
      const result = await getTarifaHistorialAction({ id: tarifaId });
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
  });
};
