"use client";
import { useQuery } from "@tanstack/react-query";
import { getAllClientesProveedoresAction } from "../server/actions/getAllClientesProveedoresAction";

export const useClientesProveedores = () => {
  return useQuery({
    queryKey: ["clientesProveedores"],
    queryFn: async () => {
      const result = await getAllClientesProveedoresAction();
      if (!result.ok || !result.data) {
        throw new Error(
          result.error || "Error al cargar clientes y proveedores"
        );
      }
      return result.data;
    },
  });
};

