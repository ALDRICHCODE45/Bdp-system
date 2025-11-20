"use client";
import { useQuery } from "@tanstack/react-query";
import { getAllFacturasAction } from "../server/actions/getAllFacturasAction";

export const useFacturas = () => {
  return useQuery({
    queryKey: ["facturas"],
    queryFn: async () => {
      const result = await getAllFacturasAction();
      if (!result.ok || !result.data) {
        throw new Error(result.error || "Error al cargar facturas");
      }
      return result.data;
    },
  });
};

