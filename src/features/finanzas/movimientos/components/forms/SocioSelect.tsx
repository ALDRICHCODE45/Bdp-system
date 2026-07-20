"use client";

import { Combobox, type ComboboxOption } from "@/core/shared/ui/combobox";

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
 * Reusable socio (partner) combobox for Movimientos forms.
 * "Ninguno" is the first option (value="") for the empty/unselected state.
 */
export function SocioSelect({
  value,
  options,
  onChange,
  disabled = false,
}: SocioSelectProps) {
  const comboboxOptions: ComboboxOption[] = [
    { value: "", label: "Ninguno" },
    ...options.map((option) => ({
      value: option.id,
      label: option.nombre,
    })),
  ];

  return (
    <Combobox
      value={value}
      onChange={onChange}
      options={comboboxOptions}
      placeholder="Seleccioná un socio"
      searchPlaceholder="Buscar socio..."
      disabled={disabled}
      className="w-full"
    />
  );
}
