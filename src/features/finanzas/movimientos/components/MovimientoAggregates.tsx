"use client";

import {
  TrendingUp,
  TrendingDown,
  Scale,
  Hash,
} from "lucide-react";
import { Card, CardContent } from "@/core/shared/ui/card";
import { Skeleton } from "@/core/shared/ui/skeleton";
import { cn } from "@/core/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MovimientoAggregatesData {
  totalIngresos: string;
  totalEgresos: string;
  countIngresos: number;
  countEgresos: number;
}

interface MovimientoAggregatesProps {
  aggregates: MovimientoAggregatesData | undefined;
  isLoading?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MXN_FORMATTER = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

function formatMXN(value: string): string {
  const n = parseFloat(value);
  if (isNaN(n)) return "$0.00";
  return MXN_FORMATTER.format(n);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MovimientoAggregates({
  aggregates,
  isLoading,
  className,
}: MovimientoAggregatesProps) {
  const totalIngresos = aggregates ? parseFloat(aggregates.totalIngresos) : 0;
  const totalEgresos = aggregates ? parseFloat(aggregates.totalEgresos) : 0;
  const saldo = totalIngresos - totalEgresos;

  const cards = [
    {
      label: "Total Ingresos",
      value: aggregates ? formatMXN(aggregates.totalIngresos) : "$0.00",
      count: aggregates?.countIngresos ?? 0,
      icon: TrendingUp,
      valueClassName: "font-bold text-emerald-600 dark:text-emerald-400",
      iconClassName: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Egresos",
      value: aggregates ? formatMXN(aggregates.totalEgresos) : "$0.00",
      count: aggregates?.countEgresos ?? 0,
      icon: TrendingDown,
      valueClassName: "text-red-600 dark:text-red-400",
      iconClassName: "text-red-600 dark:text-red-400",
    },
    {
      label: "Saldo",
      value: aggregates ? MXN_FORMATTER.format(saldo) : "$0.00",
      count: null,
      icon: Scale,
      valueClassName: cn(
        "font-bold",
        saldo >= 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400",
      ),
      iconClassName: saldo >= 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-600 dark:text-red-400",
    },
    {
      label: "Registros",
      value: aggregates
        ? `${aggregates.countIngresos.toLocaleString("es-MX")} ing. / ${aggregates.countEgresos.toLocaleString("es-MX")} egr.`
        : "0 / 0",
      count: null,
      icon: Hash,
      valueClassName: "text-foreground",
      iconClassName: "text-muted-foreground",
    },
  ];

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", className)}>
      {cards.map((card) => (
        <Card key={card.label} className="py-3">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  {card.label}
                </p>
                {isLoading ? (
                  <Skeleton className="h-5 w-24" />
                ) : (
                  <p className={cn("text-sm tabular-nums truncate", card.valueClassName)}>
                    {card.value}
                  </p>
                )}
              </div>
              <card.icon className={cn("h-5 w-5 shrink-0", card.iconClassName)} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
