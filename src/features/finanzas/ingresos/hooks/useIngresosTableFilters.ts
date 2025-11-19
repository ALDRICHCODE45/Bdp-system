import { Table } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { DateRange } from "react-day-picker";

export const useIngresosTableFilters = (table: Table<unknown>) => {
  const [selectedDateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [selectedFormaPago, setSelectedFormaPago] = useState<string>("todos");
  const [selectedFacturadoPor, setSelectedFacturadoPor] =
    useState<string>("todos");
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

  const handleFacturadoPorChange = useCallback(
    (facturadoPor: string) => {
      setSelectedFacturadoPor(facturadoPor);
      if (facturadoPor === "todos") {
        table.getColumn("facturadoPor")?.setFilterValue(undefined);
      } else {
        table.getColumn("facturadoPor")?.setFilterValue(facturadoPor);
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
  }, [table, selectedMontoRange.min, selectedMontoRange.max]);

  const clearFilters = useCallback(() => {
    setDateRange(undefined);
    setSelectedEstado("todos");
    setSelectedFormaPago("todos");
    setSelectedFacturadoPor("todos");
    setMontoRange({ min: "", max: "" });
    table.getColumn("fechaPago")?.setFilterValue(undefined);
    table.getColumn("estado")?.setFilterValue(undefined);
    table.getColumn("formaPago")?.setFilterValue(undefined);
    table.getColumn("facturadoPor")?.setFilterValue(undefined);
    table.getColumn("cantidad")?.setFilterValue(undefined);
  }, [table]);

  return {
    //variables
    selectedEstado,
    selectedFormaPago,
    selectedFacturadoPor,
    selectedMontoRange,
    selectedDateRange,
    setMontoRange,

    //methods
    handleDateRangeChange,
    handleEstadoChange,
    handleFormaPagoChange,
    handleFacturadoPorChange,
    handleMontoFilter,
    clearFilters,
  };
};
