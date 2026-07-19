"use client";

import { useState } from "react";
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

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ComboboxProps {
  options: ComboboxOption[];
  /** Controlled value = the `value` of the active option ("" when empty). */
  value: string;
  onChange: (value: string) => void;
  /** Trigger text when nothing is selected. */
  placeholder?: string;
  /** Placeholder for the search input inside the dropdown. */
  searchPlaceholder?: string;
  /** Message shown when the search matches no option. */
  emptyMessage?: string;
  disabled?: boolean;
  /** When true, re-selecting the active option clears the selection. */
  clearable?: boolean;
  id?: string;
  /** Extra classes for the trigger button (layout only). */
  className?: string;
  "aria-invalid"?: boolean;
}

/**
 * Reusable combobox: a Select replacement with text search and a
 * height-capped, scrollable option list (max-h-80, inherited from
 * CommandList). Use it instead of <Select> when there are many options and
 * the native dropdown stretches down the whole viewport.
 *
 * Controlled component: receives the active option's `value` and reports
 * changes via `onChange`. Search filters by the visible `label`.
 */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Sin resultados.",
  disabled = false,
  clearable = false,
  id,
  className,
  "aria-invalid": ariaInvalid,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);

  const handleSelect = (nextValue: string) => {
    onChange(clearable && nextValue === value ? "" : nextValue);
    setOpen(false);
  };

  return (
    // `modal` is required so the list scrolls when the combobox is rendered
    // inside a Sheet/Dialog: the parent Dialog's react-remove-scroll otherwise
    // blocks wheel events on the portaled popover. `modal` gives the popover
    // its own scroll context.
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  disabled={option.disabled}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      option.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
