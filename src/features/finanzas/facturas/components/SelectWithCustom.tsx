"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { Input } from "@/core/shared/ui/input";
import { cn } from "@/core/lib/utils";

const CUSTOM_SENTINEL = "__custom__";

interface SelectWithCustomProps {
  options: { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Select que acepta un valor libre cuando la opción elegida no está en la lista.
 * Si el valor actual no está en las opciones predefinidas, muestra el input personalizado.
 */
export function SelectWithCustom({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  className,
  disabled = false,
}: SelectWithCustomProps) {
  const isCustomValue = value !== "" && !options.find((o) => o.value === value);
  const [showCustomInput, setShowCustomInput] = useState(isCustomValue);
  const [customInput, setCustomInput] = useState(isCustomValue ? value : "");

  // Lo que el Select muestra internamente
  const selectValue = showCustomInput ? CUSTOM_SENTINEL : (value ?? "");

  const handleSelectChange = (val: string) => {
    if (val === CUSTOM_SENTINEL) {
      setShowCustomInput(true);
      setCustomInput("");
      // No propagamos valor todavía — esperamos que el usuario escriba
    } else {
      setShowCustomInput(false);
      setCustomInput("");
      onValueChange(val);
    }
  };

  const confirmCustom = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed) {
      onValueChange(trimmed);
    } else {
      // Si está vacío y había un valor previo, lo restauramos al select normal
      setShowCustomInput(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Select
        value={selectValue}
        onValueChange={handleSelectChange}
        disabled={disabled}
      >
        <SelectTrigger>
          {/* Cuando es personalizado, mostramos el valor actual en el trigger */}
          {isCustomValue && !showCustomInput ? (
            <span className="text-sm">{value}</span>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM_SENTINEL}>
            <span className="text-muted-foreground italic text-sm">
              Otro (ingresar manualmente)…
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      {showCustomInput && (
        <Input
          autoFocus
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onBlur={() => confirmCustom(customInput)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              confirmCustom(customInput);
            }
            if (e.key === "Escape") {
              setShowCustomInput(false);
              setCustomInput("");
            }
          }}
          placeholder="Ej: P01, R99, etc."
          className="text-sm"
        />
      )}
    </div>
  );
}
