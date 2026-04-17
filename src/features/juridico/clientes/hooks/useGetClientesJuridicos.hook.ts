import { useQuery } from "@tanstack/react-query";
import { getClientesJuridicosAction } from "../server/actions/getClientesJuridicosAction";

export const useGetClientesJuridicos = () => {
  return useQuery({
    queryKey: ["clientes-juridicos"],
    queryFn: async () => {
      const result = await getClientesJuridicosAction();
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
  });
};
