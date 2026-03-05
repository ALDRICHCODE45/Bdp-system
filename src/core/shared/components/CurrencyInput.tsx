"use client";

import { useState, useCallback, forwardRef } from "react";
import { Input } from "@/core/shared/ui/input";
import { cn } from "@/core/lib/utils";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Formatea un número con comas de miles y hasta 2 decimales — estilo es-MX */
function formatDisplay(value: number): string {
  if (value === 0) return "";
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Limpia el string de edición a solo dígitos y un punto decimal */
function sanitizeRaw(raw: string): string {
  // Quitar todo salvo dígitos y punto
  let cleaned = raw.replace(/[^0-9.]/g, "");

  // Permitir solo un punto decimal
  const dotIndex = cleaned.indexOf(".");
  if (dotIndex !== -1) {
    cleaned =
      cleaned.slice(0, dotIndex + 1) +
      cleaned.slice(dotIndex + 1).replace(/\./g, "");
  }

  // Remover ceros a la izquierda, pero preservar "0." para escribir decimales
  cleaned = cleaned.replace(/^0+(?=[1-9])/, ""); // "045" → "45"
  if (cleaned.startsWith(".")) cleaned = "0" + cleaned; // ".5" → "0.5"

  return cleaned;
}

function parseRaw(raw: string): number {
  const num = parseFloat(raw);
  return isFinite(num) ? Math.round(num * 100) / 100 : 0;
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  id?: string;
  name?: string;
  "aria-invalid"?: boolean;
}

// ── Componente ─────────────────────────────────────────────────────────────────

/**
 * Input numérico para cantidades monetarias.
 *
 * - Muestra el valor formateado con comas al perder el foco (ej: 45,545.50)
 * - Al enfocar, muestra el número limpio para edición (ej: 45545.50)
 * - Elimina ceros a la izquierda automáticamente
 * - Llama a `onChange(number)` en cada keystroke para auto-cálculos reactivos
 * - Compatible con readOnly para campos calculados (ej: Total)
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      placeholder = "0",
      disabled = false,
      readOnly = false,
      className,
      id,
      name,
      "aria-invalid": ariaInvalid,
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const [rawInput, setRawInput] = useState("");

    const handleFocus = useCallback(() => {
      setFocused(true);
      // Mostrar número limpio para edición — sin formato
      setRawInput(value !== 0 ? String(value) : "");
    }, [value]);

    const handleBlur = useCallback(() => {
      setFocused(false);
      // Confirmar el valor parseado al perder el foco
      const parsed = parseRaw(rawInput);
      if (parsed !== value) onChange(parsed);
      setRawInput("");
    }, [rawInput, value, onChange]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = sanitizeRaw(e.target.value);
        setRawInput(sanitized);
        // Notificar al padre en tiempo real para auto-cálculos (ej: total)
        onChange(parseRaw(sanitized));
      },
      [onChange]
    );

    const displayValue = focused
      ? rawInput
      : formatDisplay(value);

    return (
      <Input
        ref={ref}
        id={id}
        name={name}
        type="text"
        inputMode="decimal"
        value={displayValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={ariaInvalid}
        onChange={readOnly ? undefined : handleChange}
        onFocus={readOnly ? undefined : handleFocus}
        onBlur={readOnly ? undefined : handleBlur}
        className={cn(
          "tabular-nums",
          readOnly && "bg-muted/50 cursor-not-allowed",
          className
        )}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
