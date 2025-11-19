"use client";
import { useQuery } from "@tanstack/react-query";
import { getAllIngresosAction } from "../server/actions/getAllIngresosAction";

export const useIngresos = () => {
  return useQuery({
    queryKey: ["ingresos"],
    queryFn: async () => {
      const result = await getAllIngresosAction();
      if (!result.ok || !result.data) {
        throw new Error(result.error || "Error al cargar ingresos");
      }
      return result.data;
    },
  });
};

