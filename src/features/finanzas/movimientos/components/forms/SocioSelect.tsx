"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";

interface SocioOption {
  id: string;
  nombre: string;
}

interface SocioSelectProps {
  value: string;
  options: SocioOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Reusable socio (partner) select for Movimientos forms.
 * Handles the "__none__" sentinel for empty/unselected state.
 */
export function SocioSelect({
  value,
  options,
  onChange,
  disabled = false,
}: SocioSelectProps) {
  return (
    <Select
      value={value || "__none__"}
      onValueChange={(next) => onChange(next === "__none__" ? "" : next)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Seleccioná un socio" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">Ninguno</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
