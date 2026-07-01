"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/core/lib/utils";

/**
 * Item shape consumed by the generic `<Timeline />` shared component.
 *
 * The component is pure presentational — it owns NO data fetching. Callers
 * pass an already-sorted array (desc by `fecha` per the cap6 spec), and the
 * `renderItem` callback decides how each entry looks.
 *
 * Used by:
 * - `CompensacionTab` (P4) for `SalaryHistory` and `PositionHistory` rows.
 * - Future tabs can reuse this contract without touching the timeline.
 */
export type TimelineItem = {
  /** Stable identifier (used as React `key` + inside `renderItem`). */
  id: string;
  /** Display date — accepts ISO string or Date instance. */
  fecha: Date | string;
  /** Optional pre-rendered title — most callers use `renderItem` instead. */
  title?: string;
  /** Optional pre-rendered subtitle. */
  subtitle?: string;
  /** Optional pre-rendered meta line (small text, often right-aligned). */
  meta?: React.ReactNode;
};

export interface TimelineProps {
  items: TimelineItem[];
  /**
   * Renders the inner content of each timeline entry. Receives the full
   * item so the caller can pull apart dates, render fields, badges, etc.
   * Defaults to a `(title / subtitle / meta)` layout.
   */
  renderItem?: (item: TimelineItem) => React.ReactNode;
  /** Optional placeholder when `items.length === 0`. */
  emptyState?: React.ReactNode;
  /** Extra classes on the outer list container. */
  className?: string;
}

/**
 * Generic Timeline — vertical list with a left rail + dot indicator per
 * entry. Pure presentational; no data fetching.
 *
 * Caller contract:
 * - `items` MUST be ordered desc by `fecha` (the cap6 spec scenario "most
 *   recent first"). The component does not re-sort — it renders in array
 *   order so the caller stays in control of that ordering rule.
 */
export function Timeline({
  items,
  renderItem,
  emptyState,
  className,
}: TimelineProps) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          "rounded-md border border-dashed p-4 text-sm text-muted-foreground",
          className
        )}
      >
        {emptyState ?? "Aún no hay registros."}
      </div>
    );
  }

  return (
    <ol
      className={cn(
        "relative space-y-3 border-l border-muted-foreground/20 pl-4",
        className
      )}
    >
      {items.map((item) => (
        <li key={item.id} className="relative">
          {/* Rail dot — sits on the left border, sized to not steal space. */}
          <span
            aria-hidden="true"
            className="absolute -left-[22px] top-1 inline-flex h-3 w-3 items-center justify-center rounded-full border-2 border-background bg-muted-foreground/40"
          />
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <time dateTime={toIso(item.fecha)}>{formatDate(item.fecha)}</time>
            </div>
            <div className="min-w-0 flex-1">
              {renderItem ? (
                renderItem(item)
              ) : (
                <DefaultTimelineBody item={item} />
              )}
            </div>
            {item.meta ? (
              <div className="shrink-0 text-xs text-muted-foreground">
                {item.meta}
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ── Helpers (internal) ──────────────────────────────────────────────────── */

function DefaultTimelineBody({ item }: { item: TimelineItem }) {
  return (
    <div className="space-y-0.5">
      {item.title ? (
        <div className="text-sm font-medium text-foreground">{item.title}</div>
      ) : null}
      {item.subtitle ? (
        <div className="text-xs text-muted-foreground">{item.subtitle}</div>
      ) : null}
    </div>
  );
}

function toIso(fecha: Date | string): string {
  if (fecha instanceof Date) return fecha.toISOString();
  return fecha;
}

function formatDate(fecha: Date | string): string {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}