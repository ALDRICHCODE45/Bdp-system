import { BaseFilterProps } from "@/core/shared/components/DataTable/types";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/core/shared/ui/card";
import { Input } from "@/core/shared/ui/input";
import { Label } from "@/core/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { Table } from "@tanstack/react-table";
import { Download, Filter, RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import { FacturasFilterActions } from "./FacturasFilterActions";

interface FacturasFiltersProps extends BaseFilterProps {
  table: Table<unknown>;
  onGlobalFilerChange?: (value: string) => void;
}

export const FacturasTableFilters = ({
  table,
  onGlobalFilerChange,
  addButtonIcon,
  addButtonText = "Agregar",
  showAddButton = false,
}: FacturasFiltersProps) => {
  const [selectedTipo, setSelectedTipo] = useState<string>("todos");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [selectedMetodoPago, setSelectedMetodoPago] = useState<string>("todos");

  const filterTipoOptions = [
    { value: "todos", label: "Todos los tipos" },
    { value: "ingreso", label: "Ingreso" },
    { value: "egreso", label: "Egreso" },
  ] as const;
  const filterEstadoOptions = [
    { value: "todos", label: "Todos los estados" },
    { value: "Pagada", label: "pagada" },
    { value: "Enviada", label: "Enviada" },
    { value: "NoPagada", label: "No pagada" },
    { value: "Cancelada", label: "Cancelada" },
  ] as const;

  const filterMetodoPagoOptions = [
    { value: "todos", label: "Todos los estados" },
    { value: "Transferencia", label: "Transferencia" },
    { value: "Efectivo", label: "Efectivo" },
    { value: "Cheque", label: "Cheque" },
  ] as const;

  //funcion para filtrar por tipo (del origen)
  const handleTipoChange = (tipo: string) => {
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
  };

  const handleEstadoChange = (estado: string) => {
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
  };

  const handleMetodoPagoChange = (newMethod: string) => {
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
  };

  const clearFilters = () => {
    setSelectedEstado("todos");
    setSelectedMetodoPago("todos");
    setSelectedTipo("todos");
    table.getColumn("formaPago")?.setFilterValue(undefined);
    table.getColumn("estado")?.setFilterValue(undefined);
    table.getColumn("tipoOrigen")?.setFilterValue(undefined);
    onGlobalFilerChange?.("");
  };

  return (
    <Card className="mb-6 border-0 shadow-md">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="ml-2">
            {table.getFilteredRowModel().rows.length} resultados
          </Badge>
        </div>
        <div className="flex gap-2">
          <FacturasFilterActions
            showAddButton={showAddButton}
            AddButtonIcon={addButtonIcon}
            addButtonText={addButtonText}
            onClearFilters={clearFilters}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-3 px-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          {/* Búsqueda global */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-xs font-medium">
              Búsqueda
            </Label>
            <div className="relative">
              <Input
                id="search"
                className="w-full pl-9"
                placeholder="Buscar egresos..."
                value={
                  (table.getColumn("concepto")?.getFilterValue() ??
                    "") as string
                }
                onChange={(e) => {
                  table.getColumn("concepto")?.setFilterValue(e.target.value);
                  onGlobalFilerChange?.(e.target.value);
                }}
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Filtro de tipo*/}
          <div className="space-y-2">
            <Label htmlFor="categoria-filter" className="text-xs font-medium">
              Tipo
            </Label>
            <Select value={selectedTipo} onValueChange={handleTipoChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {filterTipoOptions.map((categoria) => (
                  <SelectItem key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de estado */}
          <div className="space-y-2">
            <Label htmlFor="estado-filter" className="text-xs font-medium">
              Estado
            </Label>
            <Select value={selectedEstado} onValueChange={handleEstadoChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {filterEstadoOptions.map((estado) => (
                  <SelectItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Filtro de método de pago */}
          <div className="space-y-2">
            <Label htmlFor="metodopago-filter" className="text-xs font-medium">
              Método de Pago
            </Label>
            <Select
              value={selectedMetodoPago}
              onValueChange={handleMetodoPagoChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar método de pago" />
              </SelectTrigger>
              <SelectContent>
                {filterMetodoPagoOptions.map((metodo) => (
                  <SelectItem key={metodo.value} value={metodo.value}>
                    {metodo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
