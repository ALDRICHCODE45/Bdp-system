"use client";
import { useQuery } from "@tanstack/react-query";
import { getAllEgresosAction } from "../server/actions/getAllEgresosAction";

export const useEgresos = () => {
  return useQuery({
    queryKey: ["egresos"],
    queryFn: async () => {
      const result = await getAllEgresosAction();
      if (!result.ok || !result.data) {
        throw new Error(result.error || "Error al cargar egresos");
      }
      return result.data;
    },
  });
};

