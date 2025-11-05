"use client";
import { Table } from "@tanstack/react-table";
import { useCallback, useState } from "react";

export const useUsersTableFilters = (table: Table<unknown>) => {
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");

  const handleEstadoChange = useCallback(
    (newEstado: string) => {
      setSelectedEstado(newEstado);

      if (newEstado === "todos") {
        table.getColumn("isActive")?.setFilterValue(undefined);
        return;
      }

      switch (newEstado) {
        case "activo":
          table.getColumn("isActive")?.setFilterValue(true);
          table.setPageIndex(0);
          break;
        case "inactivo":
          table.getColumn("isActive")?.setFilterValue(false);
          table.setPageIndex(0);
          break;
        default:
          break;
      }
    },
    [table]
  );

  const clearFilters = useCallback(() => {
    setSelectedEstado("todos");
    table.getColumn("isActive")?.setFilterValue(undefined);
    table.getColumn("tipo")?.setFilterValue(undefined);
  }, [table]);

  return {
    //constants
    selectedEstado,
    //methods
    handleEstadoChange,
    clearFilters,
  };
};
