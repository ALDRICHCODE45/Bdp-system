"use client";
import { AsistenciaTipo } from "@prisma/client";
import { Table } from "@tanstack/react-table";
import { useCallback, useState } from "react";

export const useAsistenciasTableFilters = (table: Table<unknown>) => {
  const [selectedTipo, setSelectedTipo] = useState<AsistenciaTipo | "todos">(
    "todos",
  );

  const handleEstadoChange = useCallback(
    (newEstado: AsistenciaTipo | "todos") => {
      setSelectedTipo(newEstado);

      if (newEstado === "todos") {
        table.getColumn("isActive")?.setFilterValue(undefined);
        return;
      }

      switch (newEstado) {
        case "Entrada":
          table.getColumn("tipo")?.setFilterValue(true);
          table.setPageIndex(0);
          break;
        case "Salida":
          table.getColumn("tipo")?.setFilterValue(false);
          table.setPageIndex(0);
          break;
        default:
          break;
      }
    },
    [table],
  );

  const clearFilters = useCallback(() => {
    setSelectedTipo("todos");
    table.getColumn("tipo")?.setFilterValue(undefined);
  }, [table]);

  return {
    //constants
    selectedTipo,
    //methods
    handleEstadoChange,
    clearFilters,
  };
};
