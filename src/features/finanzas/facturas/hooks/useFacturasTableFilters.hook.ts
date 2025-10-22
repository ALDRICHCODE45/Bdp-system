import { Table } from "@tanstack/react-table";
import { useCallback, useState } from "react";

export const useFacturasTableFilters = (table: Table<unknown>) => {
  const [selectedTipo, setSelectedTipo] = useState<string>("todos");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [selectedMetodoPago, setSelectedMetodoPago] = useState<string>("todos");

  const handleTipoChange = useCallback(
    (tipo: string) => {
      if (!tipo) {
        table.getColumn("tipoOrigen")?.setFilterValue(undefined);
        return;
      }
      setSelectedTipo(tipo);
      if (tipo === "todos") {
        table.getColumn("tipoOrigen")?.setFilterValue(undefined);
        return;
      }
      table.getColumn("tipoOrigen")?.setFilterValue(tipo);
      table.setPageIndex(0);
    },
    [table]
  );

  const handleEstadoChange = useCallback(
    (estado: string) => {
      if (!estado) {
        table.getColumn("estado")?.setFilterValue(undefined);
        return;
      }
      setSelectedEstado(estado);
      if (estado === "todos") {
        table.getColumn("estado")?.setFilterValue(undefined);
        return;
      }
      table.getColumn("estado")?.setFilterValue(estado);
      table.setPageIndex(0);
    },
    [table]
  );

  const handleMetodoPagoChange = useCallback(
    (newMethod: string) => {
      if (!newMethod) {
        table.getColumn("formaPago")?.setFilterValue(undefined);
        return;
      }
      setSelectedMetodoPago(newMethod);
      if (newMethod === "todos") {
        table.getColumn("formaPago")?.setFilterValue(undefined);
        return;
      }
      table.getColumn("formaPago")?.setFilterValue(newMethod);
      table.setPageIndex(0);
    },
    [table]
  );

  const clearFilters = useCallback(() => {
    setSelectedEstado("todos");
    setSelectedMetodoPago("todos");
    setSelectedTipo("todos");
    table.getColumn("formaPago")?.setFilterValue(undefined);
    table.getColumn("estado")?.setFilterValue(undefined);
    table.getColumn("tipoOrigen")?.setFilterValue(undefined);
  }, [table]);

  return {
    //methods
    clearFilters,
    handleEstadoChange,
    handleMetodoPagoChange,
    handleTipoChange,
    //variables
    selectedEstado,
    selectedMetodoPago,
    selectedTipo,
  };
};
