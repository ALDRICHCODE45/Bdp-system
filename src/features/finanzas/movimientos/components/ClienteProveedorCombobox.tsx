"use client";

import { useState, useMemo, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { Button } from "@/core/shared/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/core/shared/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/shared/ui/popover";
import { Label } from "@/core/shared/ui/label";
import { useClientesProveedores } from "@/features/finanzas/clientes-proovedores/hooks/useClientesProveedores.hook";

// ─── Types ────────────────────────────────────────────────────────────────────

type ClienteProveedorKind = "cliente" | "proveedor";

interface ComboboxOption {
  id: string;
  nombre: string;
}

interface ClienteProveedorComboboxProps {
  kind: ClienteProveedorKind;
  label: string;
  value: string;
  selectedId: string | null;
  onChange: (next: { value: string; selectedId: string | null }) => void;
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClienteProveedorCombobox({
  kind,
  label,
  value,
  selectedId,
  onChange,
  disabled = false,
}: ClienteProveedorComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  // Sync local inputValue when the parent's value prop changes externally
  // (e.g. form reset after a successful create).
  useEffect(() => {
    setInputValue((prev) => (prev !== value ? value : prev));
  }, [value]);

  const { data = [] } = useClientesProveedores();

  const options: ComboboxOption[] = useMemo(
    () => data.filter((item) => item.tipo === kind && item.activo),
    [data, kind]
  );

  /** Find an option by exact name match (case-insensitive). */
  const findExact = (text: string): ComboboxOption | undefined =>
    options.find((item) => item.nombre.toLowerCase() === text.trim().toLowerCase());

  const matchedOption = selectedId
    ? options.find((item) => item.id === selectedId)
    : findExact(value);

  const handleSelect = (option: ComboboxOption) => {
    setInputValue(option.nombre);
    onChange({ value: option.nombre, selectedId: option.id });
    setOpen(false);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    const exact = findExact(text);
    onChange({ value: text, selectedId: exact?.id ?? null });
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span className="truncate">
              {inputValue || (
                <span className="text-muted-foreground">
                  {`Buscar o escribir ${label.toLowerCase()}`}
                </span>
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput
              placeholder={`Buscar ${label.toLowerCase()}...`}
              value={inputValue}
              onValueChange={handleInputChange}
            />
            <CommandList>
              <CommandEmpty>Sin resultados. Se guardará como texto libre.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.nombre}
                    onSelect={() => handleSelect(option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        matchedOption?.id === option.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.nombre}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground">
        {matchedOption
          ? `Usando ${kind} existente: ${matchedOption.nombre}`
          : "Se permite texto libre. Si no coincide con un registro existente, se guarda solo como texto y no se crea automáticamente."}
      </p>
    </div>
  );
}
