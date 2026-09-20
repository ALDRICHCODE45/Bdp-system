"use client";
import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { useDebounce } from "@/core/shared/hooks/use-debounce";
import type { ClientesProveedoresFilterParams } from "../types/ClientesProveedoresFilterParams";

const ALL = "todos";

/** Filter fields forwarded to the server (pagination/sort are owned by the page). */
type ServerFilterFields = Pick<
  ClientesProveedoresFilterParams,
  | "search"
  | "tipo"
  | "activo"
  | "banco"
  | "socioResponsable"
  | "fechaRegistroFrom"
  | "fechaRegistroTo"
>;

/**
 * Owns the Clientes/Proveedores filter state and exposes:
 * - the values the filter UI renders (controlled inputs)
 * - `filterParams` — the server-ready filter payload
 * - handlers that notify the page so it can reset to page 1
 *
 * The search term is debounced (300ms) before it reaches `filterParams`, so
 * keystrokes do not trigger a request per character.
 */
export const useClientesProovedoresTableFilters = (options?: {
  onFiltersChange?: () => void;
}) => {
  const onFiltersChange = options?.onFiltersChange;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [selectedTipo, setSelectedTipo] = useState<string>(ALL);
  const [selectedEstado, setSelectedEstado] = useState<string>(ALL);
  const [selectedBanco, setSelectedBanco] = useState<string>(ALL);
  const [socioResponsableFilter, setSocioResponsableFilter] =
    useState<string>("");
  const [selectedDateRange, setDateRange] = useState<DateRange | undefined>();

  const notifyChange = useCallback(() => {
    onFiltersChange?.();
  }, [onFiltersChange]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      notifyChange();
    },
    [notifyChange],
  );

  const handleTipoChange = useCallback(
    (value: string) => {
      setSelectedTipo(value);
      notifyChange();
    },
    [notifyChange],
  );

  const handleEstadoChange = useCallback(
    (value: string) => {
      setSelectedEstado(value);
      notifyChange();
    },
    [notifyChange],
  );

  const handleBancoChange = useCallback(
    (value: string) => {
      setSelectedBanco(value);
      notifyChange();
    },
    [notifyChange],
  );

  const handleSocioResponsableChange = useCallback(
    (value: string) => {
      setSocioResponsableFilter(value);
      notifyChange();
    },
    [notifyChange],
  );

  const handleDateRangeChange = useCallback(
    (range: DateRange | undefined) => {
      setDateRange(range);
      notifyChange();
    },
    [notifyChange],
  );

  const clearFilters = useCallback(() => {
    setSearch("");
    setSelectedTipo(ALL);
    setSelectedEstado(ALL);
    setSelectedBanco(ALL);
    setSocioResponsableFilter("");
    setDateRange(undefined);
    notifyChange();
  }, [notifyChange]);

  const filterParams = useMemo<ServerFilterFields>(() => {
    const tipo: ServerFilterFields["tipo"] =
      selectedTipo === "cliente"
        ? "CLIENTE"
        : selectedTipo === "proveedor"
          ? "PROVEEDOR"
          : undefined;

    const activo =
      selectedEstado === "activo"
        ? true
        : selectedEstado === "inactivo"
          ? false
          : undefined;

    return {
      search: debouncedSearch.trim() || undefined,
      tipo,
      activo,
      banco: selectedBanco !== ALL ? selectedBanco : undefined,
      socioResponsable: socioResponsableFilter.trim() || undefined,
      fechaRegistroFrom: selectedDateRange?.from
        ? format(selectedDateRange.from, "yyyy-MM-dd")
        : undefined,
      fechaRegistroTo: selectedDateRange?.to
        ? format(selectedDateRange.to, "yyyy-MM-dd")
        : undefined,
    };
  }, [
    debouncedSearch,
    selectedTipo,
    selectedEstado,
    selectedBanco,
    socioResponsableFilter,
    selectedDateRange,
  ]);

  return {
    // values
    search,
    selectedTipo,
    selectedEstado,
    selectedBanco,
    socioResponsableFilter,
    selectedDateRange,
    filterParams,
    // handlers
    handleSearchChange,
    handleTipoChange,
    handleEstadoChange,
    handleBancoChange,
    handleSocioResponsableChange,
    handleDateRangeChange,
    clearFilters,
  };
};
