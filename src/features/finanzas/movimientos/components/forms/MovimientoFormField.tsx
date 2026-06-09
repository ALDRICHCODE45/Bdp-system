"use client";

import type { ReactNode } from "react";
import { Label } from "@/core/shared/ui/label";

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
      {title}
    </p>
  );
}

// ─── MovimientoFormField ──────────────────────────────────────────────────────
interface MovimientoFormFieldProps {
  label: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
}

export function MovimientoFormField({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
}: MovimientoFormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-1">
        <Label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        {hint && !error && (
          <span className="text-xs text-muted-foreground">{hint}</span>
        )}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
