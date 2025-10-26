import { Table } from "@tanstack/react-table";
import { useCallback, useState } from "react";

export const useClientesProovedoresTableFilters = (table: Table<unknown>) => {
  const [selectedTipo, setSelectedTipo] = useState<string>("todos");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");

  const handleTipoChange = useCallback(
    (newTipo: string) => {
      setSelectedTipo(newTipo);
      if (newTipo === "todos") {
        table.getColumn("tipo")?.setFilterValue(undefined);
        return;
      }
      table.getColumn("tipo")?.setFilterValue(newTipo);
      table.setPageIndex(0);
    },
    [table]
  );

  const handleEstadoChange = useCallback(
    (newEstado: string) => {
      setSelectedEstado(newEstado);

      if (newEstado === "todos") {
        table.getColumn("activo")?.setFilterValue(undefined);
        return;
      }

      switch (newEstado) {
        case "activo":
          table.getColumn("activo")?.setFilterValue(true);
          table.setPageIndex(0);
          break;
        case "inactivo":
          table.getColumn("activo")?.setFilterValue(false);
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
    setSelectedTipo("todos");
    table.getColumn("activo")?.setFilterValue(undefined);
    table.getColumn("tipo")?.setFilterValue(undefined);
  }, [table]);

  return {
    //constants
    selectedTipo,
    selectedEstado,
    //methods
    handleEstadoChange,
    handleTipoChange,
    clearFilters,
  };
};
