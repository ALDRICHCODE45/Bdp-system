"use client";

import { memo, useState, useCallback } from "react";
import { Label } from "@/core/shared/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/shared/ui/dropdown-menu";
import { Button } from "@/core/shared/ui/button";
import { Badge } from "@/core/shared/ui/badge";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/core/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterMultiSelectProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const FilterMultiSelect = memo(function FilterMultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = "Seleccionar...",
  disabled = false,
}: FilterMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(
    (value: string) => {
      if (selected.includes(value)) {
        onChange(selected.filter((v) => v !== value));
      } else {
        onChange([...selected, value]);
      }
    },
    [selected, onChange]
  );

  return (
    <div className="space-y-2 w-full min-w-0">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between min-w-0"
            disabled={disabled}
          >
            <span className="truncate text-sm text-muted-foreground">
              {selected.length > 0
                ? `${selected.length} seleccionado${selected.length > 1 ? "s" : ""}`
                : placeholder}
            </span>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {selected.length > 0 && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {selected.length}
                </Badge>
              )}
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-52 overflow-y-auto min-w-[var(--radix-dropdown-menu-trigger-width)]"
        >
          {options.map((option) => {
            const isChecked = selected.includes(option.value);
            return (
              <DropdownMenuItem
                key={option.value}
                onSelect={(e) => e.preventDefault()}
                onClick={() => handleToggle(option.value)}
                className="cursor-pointer gap-2"
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary transition-colors",
                    isChecked
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent"
                  )}
                >
                  {isChecked && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className="text-sm truncate">{option.label}</span>
              </DropdownMenuItem>
            );
          })}
          {options.length === 0 && (
            <p className="text-sm text-muted-foreground px-2 py-1.5">
              Sin opciones disponibles
            </p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});
