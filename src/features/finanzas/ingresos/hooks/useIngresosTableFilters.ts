import { Table } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { DateRange } from "react-day-picker";

export const useIngresosTableFilters = (table: Table<unknown>) => {
  const [selectedDateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedTipo, setSelectedTipo] = useState<string>("todos");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");

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
    [table]
  );

  const handleFormaPagoChange = useCallback(
    (tipo: string) => {
      setSelectedTipo(tipo);
      if (tipo === "todos") {
        table.getColumn("formaPago")?.setFilterValue(undefined);
      } else {
        table.getColumn("formaPago")?.setFilterValue(tipo);
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

  const clearFilters = useCallback(() => {
    setDateRange(undefined);
    setSelectedTipo("todos");
    setSelectedEstado("todos");
    table.getColumn("fecha")?.setFilterValue(undefined);
    table.getColumn("tipo")?.setFilterValue(undefined);
    table.getColumn("estado")?.setFilterValue(undefined);
  }, [table]);

  return {
    //metodos
    selectedEstado,
    selectedTipo,
    selectedDateRange,

    //variables
    handleDateRangeChange,
    handleEstadoChange,
    handleFormaPagoChange,
    clearFilters,
  };
};
