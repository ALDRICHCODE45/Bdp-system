"use client";
import { useQuery } from "@tanstack/react-query";
import { getFirstEmpresaAction } from "../server/actions/getFirstEmpresaAction";

export const useGetEmpresa = () => {
  return useQuery({
    queryKey: ["empresa"],
    queryFn: async () => {
      const result = await getFirstEmpresaAction();
      if (!result.ok) {
        throw new Error(result.error || "Error al obtener empresa");
      }
      return result.data;
    },
  });
};

