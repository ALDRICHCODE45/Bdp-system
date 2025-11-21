import { useQuery } from "@tanstack/react-query";
import { getColaboradorHistorialAction } from "../server/actions/getColaboradorHistorialAction";
import { ColaboradorHistorialDto } from "../server/dtos/ColaboradorHistorialDto.dto";

export const useColaboradorHistorial = (
  colaboradorId: string,
  enabled: boolean = true
) => {
  return useQuery<ColaboradorHistorialDto[]>({
    queryKey: ["colaborador-historial", colaboradorId],
    queryFn: async () => {
      const result = await getColaboradorHistorialAction(colaboradorId);
      if (!result.ok || !result.data) {
        throw new Error(result.error || "Error al cargar historial");
      }
      return result.data;
    },
    enabled: enabled && !!colaboradorId,
  });
};

