"use client";

import { useMemo, useState } from "react";
import type { Table } from "@tanstack/react-table";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/core/shared/ui/card";
import { FilterHeaderActions } from "@/core/shared/components/DataTable/FilterHeaderActions";
import { FilterMultiSelect } from "@/core/shared/components/DataTable/FilterMultiSelect";
import { ColumnVisibilitySelector } from "@/core/shared/components/DataTable/ColumnVisibilitySelector";
import type { BaseFilterProps } from "@/core/shared/components/DataTable/types";
import { useGetEquiposJuridicos } from "@/features/juridico/equipos/hooks/useGetEquiposJuridicos.hook";
import { useGetClientesJuridicos } from "@/features/juridico/clientes/hooks/useGetClientesJuridicos.hook";
import { useGetActiveUsersForReporte } from "../hooks/useGetActiveUsersForReporte.hook";
import {
  countActiveRegistroHorasAdvancedFilters,
  type RegistroHorasAdvancedFilters,
} from "../types/RegistroHorasAdvancedFilters.type";
import { RegistroHorasAdvancedFiltersSheet } from "./RegistroHorasAdvancedFiltersSheet";

interface RegistroHorasTableFiltersProps extends BaseFilterProps {
  table: Table<unknown>;
  onGlobalFilterChange?: (value: string) => void;
  equipoJuridicoIds?: string[];
  clienteJuridicoIds?: string[];
  usuarioIds?: string[];
  onEquipoJuridicoIdsChange?: (value: string[]) => void;
  onClienteJuridicoIdsChange?: (value: string[]) => void;
  onUsuarioIdsChange?: (value: string[]) => void;
  canFilterByUsuario?: boolean;
  onClearFilters?: () => void;
  advancedFilters?: RegistroHorasAdvancedFilters;
  onApplyAdvancedFilters?: (filters: RegistroHorasAdvancedFilters) => void;
}

export function RegistroHorasTableFilters({
  table,
  onGlobalFilterChange,
  showAddButton,
  addButtonIcon,
  addButtonText = "Registrar Horas",
  onAdd,
  equipoJuridicoIds = [],
  clienteJuridicoIds = [],
  usuarioIds = [],
  onEquipoJuridicoIdsChange,
  onClienteJuridicoIdsChange,
  onUsuarioIdsChange,
  canFilterByUsuario = false,
  onClearFilters,
  advancedFilters,
  onApplyAdvancedFilters,
}: RegistroHorasTableFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: equipos } = useGetEquiposJuridicos();
  const { data: clientes } = useGetClientesJuridicos();
  const { data: usuarios } = useGetActiveUsersForReporte(canFilterByUsuario);

  const equipoOptions = useMemo(
    () => (equipos ?? []).map((e) => ({ value: e.id, label: e.nombre })),
    [equipos]
  );
  const clienteOptions = useMemo(
    () => (clientes ?? []).map((c) => ({ value: c.id, label: c.nombre })),
    [clientes]
  );
  const usuarioOptions = useMemo(
    () =>
      (usuarios ?? []).map((u) => ({
        value: u.id,
        label: u.name || u.email,
      })),
    [usuarios]
  );

  const activeAdvancedCount = advancedFilters
    ? countActiveRegistroHorasAdvancedFilters(advancedFilters)
    : 0;

  const handleClearAll = () => {
    onClearFilters?.();
    onGlobalFilterChange?.("");
  };

  return (
    <>
      <Card className="mb-6 w-full min-w-0">
        <CardHeader className="pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Filter className="h-5 w-5 text-primary flex-shrink-0" />
            <Badge variant="outline" className="flex-shrink-0">
              {table.getRowCount()} resultados
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto min-w-0">
            <ColumnVisibilitySelector table={table} />
            <FilterHeaderActions
              showAddButton={showAddButton}
              AddButtonIcon={addButtonIcon}
              addButtonText={addButtonText}
              buttonTooltipText="Registrar horas"
              onAdd={onAdd}
              onClearFilters={handleClearAll}
            />
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <FilterMultiSelect
              label="Equipo"
              options={equipoOptions}
              selected={equipoJuridicoIds}
              onChange={(v) => onEquipoJuridicoIdsChange?.(v)}
              placeholder="Todos"
            />
            <FilterMultiSelect
              label="Cliente"
              options={clienteOptions}
              selected={clienteJuridicoIds}
              onChange={(v) => onClienteJuridicoIdsChange?.(v)}
              placeholder="Todos"
            />
            {canFilterByUsuario ? (
              <FilterMultiSelect
                label="Abogado"
                options={usuarioOptions}
                selected={usuarioIds}
                onChange={(v) => onUsuarioIdsChange?.(v)}
                placeholder="Todos"
              />
            ) : (
              <div />
            )}

            <div className="space-y-2">
              <span className="block text-xs font-medium text-muted-foreground">
                Mas filtros
              </span>
              <Button
                variant="outline"
                className="w-full gap-2 relative"
                onClick={() => setSheetOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {activeAdvancedCount > 0 && (
                  <Badge className="ml-auto h-5 min-w-5 px-1 text-xs flex items-center justify-center">
                    {activeAdvancedCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {onApplyAdvancedFilters && advancedFilters && (
        <RegistroHorasAdvancedFiltersSheet
          isOpen={sheetOpen}
          onOpenChange={setSheetOpen}
          appliedFilters={advancedFilters}
          onApply={onApplyAdvancedFilters}
        />
      )}
    </>
  );
}
