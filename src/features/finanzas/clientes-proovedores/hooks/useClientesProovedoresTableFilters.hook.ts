import { Table } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { DateRange } from "react-day-picker";

export const useClientesProovedoresTableFilters = (table: Table<unknown>) => {
  const [selectedTipo, setSelectedTipo] = useState<string>("todos");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [selectedBanco, setSelectedBanco] = useState<string>("todos");
  const [socioResponsableFilter, setSocioResponsableFilter] = useState<string>("");
  const [selectedDateRange, setDateRange] = useState<DateRange | undefined>();

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

  const handleBancoChange = useCallback(
    (banco: string) => {
      setSelectedBanco(banco);
      if (banco === "todos") {
        table.getColumn("banco")?.setFilterValue(undefined);
      } else {
        table.getColumn("banco")?.setFilterValue(banco);
      }
      table.setPageIndex(0);
    },
    [table]
  );

  const handleSocioResponsableChange = useCallback(
    (value: string) => {
      setSocioResponsableFilter(value);
      table.getColumn("socioResponsable")?.setFilterValue(value || undefined);
      table.setPageIndex(0);
    },
    [table]
  );

  const handleDateRangeChange = useCallback(
    (range: DateRange | undefined) => {
      setDateRange(range);
      if (!range || (!range.from && !range.to)) {
        table.getColumn("fechaRegistro")?.setFilterValue(undefined);
        return;
      }
      table.getColumn("fechaRegistro")?.setFilterValue(range);
      table.setPageIndex(0);
    },
    [table]
  );

  const clearFilters = useCallback(() => {
    setSelectedEstado("todos");
    setSelectedTipo("todos");
    setSelectedBanco("todos");
    setSocioResponsableFilter("");
    setDateRange(undefined);
    table.getColumn("activo")?.setFilterValue(undefined);
    table.getColumn("tipo")?.setFilterValue(undefined);
    table.getColumn("banco")?.setFilterValue(undefined);
    table.getColumn("socioResponsable")?.setFilterValue(undefined);
    table.getColumn("fechaRegistro")?.setFilterValue(undefined);
  }, [table]);

  return {
    //constants
    selectedTipo,
    selectedEstado,
    selectedBanco,
    socioResponsableFilter,
    selectedDateRange,
    //methods
    handleEstadoChange,
    handleTipoChange,
    handleBancoChange,
    handleSocioResponsableChange,
    handleDateRangeChange,
    clearFilters,
  };
};
