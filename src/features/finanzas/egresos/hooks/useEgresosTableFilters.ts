import { Table } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { DateRange } from "react-day-picker";

export const useEgresosTableFilters = (table: Table<unknown>) => {
  const [selectedDateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCategoria, setSelectedCategoria] = useState<string>("todos");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [selectedMontoRange, setMontoRange] = useState({ min: "", max: "" });

  const handleDateRangeChange = useCallback(
    (range: DateRange | undefined) => {
      setDateRange(range);
      if (!range || (!range.from && !range.to)) {
        table.getColumn("fechaPago")?.setFilterValue(undefined);
        return;
      }
      table.getColumn("fechaPago")?.setFilterValue(range);
      table.setPageIndex(0);
    },
    [table]
  );

  const handleCategoriaChange = useCallback(
    (categoria: string) => {
      setSelectedCategoria(categoria);
      if (categoria === "todos") {
        table.getColumn("categoria")?.setFilterValue(undefined);
      } else {
        table.getColumn("categoria")?.setFilterValue(categoria);
      }
      table.setPageIndex(0);
    },
    [table]
  );

  const handleEstadoChange = useCallback(
    (estado: string) => {
      setSelectedEstado(estado);
      if (estado === "todos") {
        table.getColumn("estado")?.setFilterValue(undefined);
      } else {
        table.getColumn("estado")?.setFilterValue(estado);
      }
      table.setPageIndex(0);
    },
    [table]
  );

  const handleMontoFilter = useCallback(() => {
    const min = selectedMontoRange.min
      ? parseFloat(selectedMontoRange.min)
      : undefined;
    const max = selectedMontoRange.max
      ? parseFloat(selectedMontoRange.max)
      : undefined;

    if (min !== undefined || max !== undefined) {
      table.getColumn("cantidad")?.setFilterValue({ min, max });
    } else {
      table.getColumn("cantidad")?.setFilterValue(undefined);
    }
    table.setPageIndex(0);
  }, [table]);

  const clearFilters = useCallback(() => {
    setDateRange(undefined);
    setSelectedCategoria("todos");
    setSelectedEstado("todos");
    setMontoRange({ min: "", max: "" });
    table.getColumn("fechaPago")?.setFilterValue(undefined);
    table.getColumn("categoria")?.setFilterValue(undefined);
    table.getColumn("estado")?.setFilterValue(undefined);
    table.getColumn("cantidad")?.setFilterValue(undefined);
  }, [table]);

  return {
    //variables
    selectedCategoria,
    selectedEstado,
    selectedMontoRange,
    selectedDateRange,
    setMontoRange,

    //methods
    handleCategoriaChange,
    handleDateRangeChange,
    handleEstadoChange,
    handleMontoFilter,
    clearFilters,
  };
};
