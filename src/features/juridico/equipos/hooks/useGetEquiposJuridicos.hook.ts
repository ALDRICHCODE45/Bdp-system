import { useQuery } from "@tanstack/react-query";
import { getEquiposJuridicosAction } from "../server/actions/getEquiposJuridicosAction";

export const useGetEquiposJuridicos = () => {
  return useQuery({
    queryKey: ["equipos-juridicos"],
    queryFn: async () => {
      const result = await getEquiposJuridicosAction();
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
  });
};
