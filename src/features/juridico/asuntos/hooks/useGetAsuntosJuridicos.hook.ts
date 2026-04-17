import { useQuery } from "@tanstack/react-query";
import { getAsuntosJuridicosAction } from "../server/actions/getAsuntosJuridicosAction";

export const useGetAsuntosJuridicos = () => {
  return useQuery({
    queryKey: ["asuntos-juridicos"],
    queryFn: async () => {
      const result = await getAsuntosJuridicosAction();
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
  });
};
