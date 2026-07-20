"use client";

import { Label } from "@/core/shared/ui/label";
import { Combobox, type ComboboxOption } from "@/core/shared/ui/combobox";

interface FilterSelectProps {
  value: string;
  label: string;
  options: readonly { value: string; label: string }[];
  onValueChange: (value: string) => void;
}

export const FilterSelect = ({
  label,
  onValueChange,
  options,
  value,
}: FilterSelectProps) => {
  return (
    <div className="space-y-2 w-full min-w-0">
      <Label htmlFor="categoria-filter" className="text-xs font-medium">
        {label}
      </Label>
      <Combobox
        value={value}
        onChange={onValueChange}
        options={options as ComboboxOption[]}
        placeholder={`Seleccionar ${label.toLowerCase()}`}
        searchPlaceholder={`Buscar ${label.toLowerCase()}...`}
        className="w-full min-w-0"
      />
    </div>
  );
};
