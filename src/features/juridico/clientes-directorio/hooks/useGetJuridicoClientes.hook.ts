import { useQuery } from "@tanstack/react-query";
import { getJuridicoClientesAction } from "../server/actions/getJuridicoClientesAction";

export const useGetJuridicoClientes = () => {
  return useQuery({
    queryKey: ["juridico-clientes-directorio"],
    queryFn: async () => {
      const result = await getJuridicoClientesAction();
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
    staleTime: 60_000,
  });
};