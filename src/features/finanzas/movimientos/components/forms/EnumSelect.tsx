"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";

interface EnumSelectProps {
  value: string;
  placeholder: string;
  options: readonly string[];
  onChange: (value: string) => void;
  allowEmpty?: boolean;
  disabled?: boolean;
}

/**
 * Reusable enum select for Movimientos forms.
 * Handles the "__none__" sentinel pattern for empty/optional values.
 */
export function EnumSelect({
  value,
  placeholder,
  options,
  onChange,
  allowEmpty = true,
  disabled = false,
}: EnumSelectProps) {
  return (
    <Select
      value={value || (allowEmpty ? "__none__" : undefined)}
      onValueChange={(next) => onChange(next === "__none__" ? "" : next)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowEmpty ? (
          <SelectItem value="__none__">Ninguno</SelectItem>
        ) : null}
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
