import { Table } from "@tanstack/react-table";
import { useCallback, useState } from "react";

export const useFacturasTableFilters = (table: Table<unknown>) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [selectedMetodoPago, setSelectedMetodoPago] = useState<string>("todos");
  const [selectedMoneda, setSelectedMoneda] = useState<string>("todos");
  const [selectedStatusPago, setSelectedStatusPago] = useState<string>("todos");
  const handleStatusChange = useCallback(
    (status: string) => {
      setSelectedStatus(status);
      if (status === "todos") {
        table.getColumn("status")?.setFilterValue(undefined);
      } else {
        table.getColumn("status")?.setFilterValue(status);
      }
    },
    [table]
  );

  const handleMetodoPagoChange = useCallback(
    (metodoPago: string) => {
      setSelectedMetodoPago(metodoPago);
      if (metodoPago === "todos") {
        table.getColumn("metodoPago")?.setFilterValue(undefined);
      } else {
        table.getColumn("metodoPago")?.setFilterValue(metodoPago);
      }
    },
    [table]
  );

  const handleMonedaChange = useCallback(
    (moneda: string) => {
      setSelectedMoneda(moneda);
      if (moneda === "todos") {
        table.getColumn("moneda")?.setFilterValue(undefined);
      } else {
        table.getColumn("moneda")?.setFilterValue(moneda);
      }
    },
    [table]
  );

  const handleStatusPagoChange = useCallback(
    (statusPago: string) => {
      setSelectedStatusPago(statusPago);
      if (statusPago === "todos") {
        table.getColumn("statusPago")?.setFilterValue(undefined);
      } else {
        table.getColumn("statusPago")?.setFilterValue(statusPago);
      }
    },
    [table]
  );

  const clearFilters = useCallback(() => {
    setSelectedStatus("todos");
    setSelectedMetodoPago("todos");
    setSelectedMoneda("todos");
    setSelectedStatusPago("todos");
    table.getColumn("status")?.setFilterValue(undefined);
    table.getColumn("metodoPago")?.setFilterValue(undefined);
    table.getColumn("moneda")?.setFilterValue(undefined);
    table.getColumn("statusPago")?.setFilterValue(undefined);
  }, [table]);

  return {
    selectedStatus,
    selectedMetodoPago,
    selectedMoneda,
    selectedStatusPago,
    handleStatusChange,
    handleMetodoPagoChange,
    handleMonedaChange,
    handleStatusPagoChange,
    clearFilters,
  };
};
