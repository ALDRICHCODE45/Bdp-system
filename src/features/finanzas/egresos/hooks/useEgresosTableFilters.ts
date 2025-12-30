import { Table } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { DateRange } from "react-day-picker";

export const useEgresosTableFilters = (table: Table<unknown>) => {
  const [selectedDateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCategoria, setSelectedCategoria] = useState<string>("todos");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [selectedMontoRange, setMontoRange] = useState({ min: "", max: "" });
  const [selectedClasificacion, setSelectedClasificacion] = useState<string>("todos");
  const [selectedFormaPago, setSelectedFormaPago] = useState<string>("todos");
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("todos");
  const [proveedorFilter, setProveedorFilter] = useState<string>("");

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
  }, [table, selectedMontoRange]);

  const handleClasificacionChange = useCallback(
    (clasificacion: string) => {
      setSelectedClasificacion(clasificacion);
      if (clasificacion === "todos") {
        table.getColumn("clasificacion")?.setFilterValue(undefined);
      } else {
        table.getColumn("clasificacion")?.setFilterValue(clasificacion);
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

  const handlePeriodoChange = useCallback(
    (periodo: string) => {
      setSelectedPeriodo(periodo);
      if (periodo === "todos") {
        table.getColumn("periodo")?.setFilterValue(undefined);
      } else {
        table.getColumn("periodo")?.setFilterValue(periodo);
      }
      table.setPageIndex(0);
    },
    [table]
  );

  const handleProveedorChange = useCallback(
    (value: string) => {
      setProveedorFilter(value);
      table.getColumn("proveedor")?.setFilterValue(value || undefined);
      table.setPageIndex(0);
    },
    [table]
  );

  const clearFilters = useCallback(() => {
    setDateRange(undefined);
    setSelectedCategoria("todos");
    setSelectedEstado("todos");
    setMontoRange({ min: "", max: "" });
    setSelectedClasificacion("todos");
    setSelectedFormaPago("todos");
    setSelectedPeriodo("todos");
    setProveedorFilter("");
    table.getColumn("fechaPago")?.setFilterValue(undefined);
    table.getColumn("categoria")?.setFilterValue(undefined);
    table.getColumn("estado")?.setFilterValue(undefined);
    table.getColumn("cantidad")?.setFilterValue(undefined);
    table.getColumn("clasificacion")?.setFilterValue(undefined);
    table.getColumn("formaPago")?.setFilterValue(undefined);
    table.getColumn("periodo")?.setFilterValue(undefined);
    table.getColumn("proveedor")?.setFilterValue(undefined);
  }, [table]);

  return {
    //variables
    selectedCategoria,
    selectedEstado,
    selectedMontoRange,
    selectedDateRange,
    selectedClasificacion,
    selectedFormaPago,
    selectedPeriodo,
    proveedorFilter,
    setMontoRange,

    //methods
    handleCategoriaChange,
    handleDateRangeChange,
    handleEstadoChange,
    handleMontoFilter,
    handleClasificacionChange,
    handleFormaPagoChange,
    handlePeriodoChange,
    handleProveedorChange,
    clearFilters,
  };
};
