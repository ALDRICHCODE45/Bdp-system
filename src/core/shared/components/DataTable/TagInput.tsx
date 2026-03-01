"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/core/shared/ui/badge";
import { Label } from "@/core/shared/ui/label";
import { cn } from "@/core/lib/utils";

interface TagInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  label,
  values,
  onChange,
  placeholder = "Escribir y presionar Enter...",
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (tag: string) => {
    onChange(values.filter((v) => v !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && values.length > 0) {
      removeTag(values[values.length - 1]);
    }
  };

  return (
    <div className={cn("space-y-2 w-full", className)}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {/* Tags + input container */}
      <div
        className={cn(
          "flex flex-wrap gap-1.5 min-h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "cursor-text focus-within:ring-1 focus-within:ring-ring transition-shadow"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {values.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-1 text-xs shrink-0 font-normal"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="ml-0.5 hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) addTag(inputValue);
          }}
          placeholder={values.length === 0 ? placeholder : ""}
          className="flex-1 min-w-24 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
      </div>
      {values.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {values.length} valor{values.length !== 1 ? "es" : ""} — se busca con OR entre ellos
        </p>
      )}
    </div>
  );
}
