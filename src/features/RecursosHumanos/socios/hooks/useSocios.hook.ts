"use client";
import { useQuery } from "@tanstack/react-query";
import { getAllSociosAction } from "../server/actions/getAllSociosAction";

export const useSocios = () => {
  return useQuery({
    queryKey: ["socios"],
    queryFn: async () => {
      const result = await getAllSociosAction();
      if (!result.ok || !result.data) {
        throw new Error(result.error || "Error al cargar socios");
      }
      return result.data;
    },
  });
};
