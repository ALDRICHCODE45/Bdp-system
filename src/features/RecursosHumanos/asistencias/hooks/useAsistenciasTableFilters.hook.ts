"use client";
import { AsistenciaTipo } from "@prisma/client";
import { Table } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { DateRange } from "react-day-picker";

export const useAsistenciasTableFilters = (table: Table<unknown>) => {
  const [selectedTipo, setSelectedTipo] = useState<AsistenciaTipo | "todos">(
    "todos",
  );
  const [selectedDateRange, setDateRange] = useState<DateRange | undefined>();
  const [nombreColaboradorFilter, setNombreColaboradorFilter] = useState<string>("");

  const handleTipoChange = useCallback(
    (newTipo: string) => {
      setSelectedTipo(newTipo as AsistenciaTipo | "todos");

      if (newTipo === "todos") {
        table.getColumn("tipo")?.setFilterValue(undefined);
        return;
      }

      table.getColumn("tipo")?.setFilterValue(newTipo);
      table.setPageIndex(0);
    },
    [table],
  );

  const handleDateRangeChange = useCallback(
    (range: DateRange | undefined) => {
      setDateRange(range);
      if (!range || (!range.from && !range.to)) {
        table.getColumn("fecha")?.setFilterValue(undefined);
        return;
      }
      table.getColumn("fecha")?.setFilterValue(range);
      table.setPageIndex(0);
    },
    [table],
  );

  const handleNombreColaboradorChange = useCallback(
    (value: string) => {
      setNombreColaboradorFilter(value);
      table.getColumn("colaboradorNombre")?.setFilterValue(value || undefined);
      table.setPageIndex(0);
    },
    [table],
  );

  const clearFilters = useCallback(() => {
    setSelectedTipo("todos");
    setDateRange(undefined);
    setNombreColaboradorFilter("");
    table.getColumn("tipo")?.setFilterValue(undefined);
    table.getColumn("fecha")?.setFilterValue(undefined);
    table.getColumn("colaboradorNombre")?.setFilterValue(undefined);
  }, [table]);

  return {
    //constants
    selectedTipo,
    selectedDateRange,
    nombreColaboradorFilter,
    //methods
    handleTipoChange,
    handleDateRangeChange,
    handleNombreColaboradorChange,
    clearFilters,
  };
};
