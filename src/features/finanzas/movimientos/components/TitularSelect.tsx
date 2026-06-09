"use client";

import { useMemo, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Button } from "@/core/shared/ui/button";
import { Input } from "@/core/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { useDistinctTitulares } from "../hooks/useDistinctTitulares.hook";

interface TitularSelectProps {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
}

export function TitularSelect({ value, onChange, options: externalOptions }: TitularSelectProps) {
  const { data: fetchedTitulares = [] } = useDistinctTitulares();
  const [showNewInput, setShowNewInput] = useState(false);
  const [draft, setDraft] = useState("");
  const [localTitulares, setLocalTitulares] = useState<string[]>([]);

  const options = useMemo(() => {
    const base = externalOptions ?? fetchedTitulares;
    const merged = new Set([...base, ...localTitulares]);
    if (value.trim()) merged.add(value.trim());
    return Array.from(merged).sort((a, b) => a.localeCompare(b));
  }, [externalOptions, fetchedTitulares, localTitulares, value]);

  const confirmNew = () => {
    const next = draft.trim();
    if (!next) return;
    setLocalTitulares((prev) =>
      prev.includes(next) ? prev : [...prev, next]
    );
    onChange(next);
    setDraft("");
    setShowNewInput(false);
  };

  const cancelNew = () => {
    setDraft("");
    setShowNewInput(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select value={value || undefined} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccioná un titular existente" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!showNewInput && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowNewInput(true)}
            aria-label="Agregar nuevo titular"
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showNewInput && (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            value={draft}
            placeholder="Escribí el nuevo titular"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                confirmNew();
              }
              if (e.key === "Escape") {
                cancelNew();
              }
            }}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={confirmNew}
            aria-label="Confirmar nuevo titular"
            className="shrink-0"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={cancelNew}
            aria-label="Cancelar"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
