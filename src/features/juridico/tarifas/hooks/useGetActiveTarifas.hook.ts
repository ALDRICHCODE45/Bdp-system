import { useQuery } from "@tanstack/react-query";
import { getActiveTarifasAction } from "../server/actions/getActiveTarifasAction";

export const useGetActiveTarifas = () => {
  return useQuery({
    queryKey: ["tarifas-abogado-asunto", "active"],
    queryFn: async () => {
      const result = await getActiveTarifasAction();
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
  });
};
