import { Table } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { DateRange } from "react-day-picker";

export const useFacturasTableFilters = (table: Table<unknown>) => {
  const [selectedDateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [selectedTipoOrigen, setSelectedTipoOrigen] = useState<string>("todos");
  const [selectedFormaPago, setSelectedFormaPago] = useState<string>("todos");
  const [selectedMontoRange, setMontoRange] = useState({ min: "", max: "" });

  const handleDateRangeChange = useCallback(
    (range: DateRange | undefined) => {
      setDateRange(range);
      if (!range || (!range.from && !range.to)) {
        table.getColumn("fechaEmision")?.setFilterValue(undefined);
        return;
      }
      table.getColumn("fechaEmision")?.setFilterValue(range);
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

  const handleTipoOrigenChange = useCallback(
    (tipoOrigen: string) => {
      setSelectedTipoOrigen(tipoOrigen);
      if (tipoOrigen === "todos") {
        table.getColumn("tipoOrigen")?.setFilterValue(undefined);
      } else {
        table.getColumn("tipoOrigen")?.setFilterValue(tipoOrigen);
      }
      table.setPageIndex(0);
    },
    [table]
  );

  const handleFormaPagoChange = useCallback(
    (formaPago: string) => {
      setSelectedFormaPago(formaPago);
      if (formaPago === "todos") {
        table.getColumn("formaPago")?.setFilterValue(undefined);
      } else {
        table.getColumn("formaPago")?.setFilterValue(formaPago);
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
      table.getColumn("monto")?.setFilterValue({ min, max });
    } else {
      table.getColumn("monto")?.setFilterValue(undefined);
    }
    table.setPageIndex(0);
  }, [table, selectedMontoRange]);

  const clearFilters = useCallback(() => {
    setDateRange(undefined);
    setSelectedEstado("todos");
    setSelectedTipoOrigen("todos");
    setSelectedFormaPago("todos");
    setMontoRange({ min: "", max: "" });
    table.getColumn("fechaEmision")?.setFilterValue(undefined);
    table.getColumn("estado")?.setFilterValue(undefined);
    table.getColumn("tipoOrigen")?.setFilterValue(undefined);
    table.getColumn("formaPago")?.setFilterValue(undefined);
    table.getColumn("monto")?.setFilterValue(undefined);
  }, [table]);

  return {
    //variables
    selectedEstado,
    selectedTipoOrigen,
    selectedFormaPago,
    selectedMontoRange,
    selectedDateRange,
    //handlers
    handleDateRangeChange,
    handleEstadoChange,
    handleTipoOrigenChange,
    handleFormaPagoChange,
    handleMontoFilter,
    setMontoRange,
    clearFilters,
  };
};
