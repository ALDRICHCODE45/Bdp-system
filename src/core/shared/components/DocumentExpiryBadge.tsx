"use client";

import { differenceInCalendarDays } from "date-fns";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/core/shared/ui/badge";
import { cn } from "@/core/lib/utils";

/**
 * P5 — cap8 req4 / CC9 expiry badge.
 *
 * Thresholds (CC9 — visual-only, no notification side-effects):
 *   - `expiryDate <  today`         → red    "Vencido"
 *   - `0  ≤ d ≤ 30`                 → amber  "Por vencer"
 *   - `d > 30`                      → green  "Vigente"
 *   - `expiryDate === null`         → nothing rendered (returns null)
 *
 * Computation is client-side from the `expiryDate` prop. We use
 * `differenceInCalendarDays` (date-fns) so the comparison ignores the time
 * component — a document that expires at 00:00 today still counts as 0
 * days from now (still valid through the day, not yet "Vencido").
 */
export interface DocumentExpiryBadgeProps {
  expiryDate: Date | string | null | undefined;
  className?: string;
}

type Variant = "vencido" | "por-vencer" | "vigente";

const LABEL: Record<Variant, string> = {
  vencido: "Vencido",
  "por-vencer": "Por vencer",
  vigente: "Vigente",
};

const VARIANT_STYLES: Record<Variant, string> = {
  vencido: "border-transparent bg-red-500 text-white",
  "por-vencer": "border-transparent bg-amber-500 text-white",
  vigente: "border-transparent bg-green-500 text-white",
};

const ICON: Record<Variant, React.ComponentType<{ className?: string }>> = {
  vencido: XCircle,
  "por-vencer": AlertTriangle,
  vigente: CheckCircle2,
};

export function DocumentExpiryBadge({
  expiryDate,
  className,
}: DocumentExpiryBadgeProps) {
  // null/undefined expiryDate → no badge (CC9).
  if (expiryDate === null || expiryDate === undefined || expiryDate === "") {
    return null;
  }

  const date = expiryDate instanceof Date ? expiryDate : new Date(expiryDate);
  if (Number.isNaN(date.getTime())) {
    // Unparseable value — render nothing rather than a wrong badge.
    return null;
  }

  // differenceInCalendarDays is timezone-aware in the user's local time. We
  // intentionally compare against `new Date()` (now) so the badge flips
  // automatically as time passes without any cron or refresh.
  const daysUntilExpiry = differenceInCalendarDays(date, new Date());

  const variant: Variant =
    daysUntilExpiry < 0
      ? "vencido"
      : daysUntilExpiry <= 30
        ? "por-vencer"
        : "vigente";

  const Icon = ICON[variant];

  return (
    <Badge
      variant="default"
      className={cn(VARIANT_STYLES[variant], className)}
      title={`Vence el ${date.toLocaleDateString("es-MX")}`}
    >
      <Icon className="h-3 w-3" />
      {LABEL[variant]}
    </Badge>
  );
}