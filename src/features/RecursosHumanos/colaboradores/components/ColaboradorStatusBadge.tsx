"use client";

import { Badge } from "@/core/shared/ui/badge";
import { cn } from "@/core/lib/utils";
import { STATUS_LABELS } from "../helpers/colaboradorLabels";

/**
 * Status badge for Colaborador Estado.
 *
 * SPEC cap1 req7: at most 3 color tokens (success / warning / muted).
 *
 * Mapping:
 * - CONTRATADO   → success  (green)
 * - EN_LICENCIA  → warning  (amber)
 * - DESPEDIDO    → muted    (secondary, neutral)
 * - other        → secondary (fallback)
 */
const STATUS_STYLES: Record<string, string> = {
  CONTRATADO:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0",
  EN_LICENCIA:
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-0",
  DESPEDIDO:
    "bg-muted text-muted-foreground border-0",
};

export function ColaboradorStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "";
  const label = STATUS_LABELS[status] ?? status;
  return (
    <Badge
      variant="secondary"
      className={cn("text-xs capitalize rounded-xs", style)}
    >
      {label}
    </Badge>
  );
}