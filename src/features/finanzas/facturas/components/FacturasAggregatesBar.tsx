"use client";

import { Sigma, TrendingUp, Receipt, Calculator } from "lucide-react";
import { Badge } from "@/core/shared/ui/badge";
import { Skeleton } from "@/core/shared/ui/skeleton";
import { cn } from "@/core/lib/utils";
import type { FacturasAggregatesDto } from "../server/dtos/FacturasAggregatesDto.dto";
import { getCurrencyFormatter } from "./FacturasTableColumns";

interface Props {
  data: FacturasAggregatesDto | undefined;
  isLoading: boolean;
  className?: string;
}

const FIELDS = [
  { key: "total" as const,                       label: "Total",          icon: TrendingUp },
  { key: "subtotal" as const,                    label: "Subtotal",       icon: Receipt    },
  { key: "totalImpuestosTransladados" as const,  label: "Imp. Trasladados", icon: Calculator },
  { key: "totalImpuestosRetenidos" as const,     label: "Imp. Retenidos",   icon: Calculator },
] as const;

function Amount({ value, currency }: { value: number | null; currency: string }) {
  if (value == null || value === 0) return null;
  return (
    <span className="font-semibold text-sm tabular-nums">
      {getCurrencyFormatter(currency).format(value)}
    </span>
  );
}

export function FacturasAggregatesBar({ data, isLoading, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-muted/30 dark:bg-muted/20 px-4 py-3 transition-all duration-200",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sigma className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Totales de{" "}
          {isLoading ? (
            <Skeleton className="inline-block h-3 w-10 align-middle" />
          ) : (
            <span className="text-foreground font-semibold">
              {data?.totalCount.toLocaleString("es-MX") ?? "0"}
            </span>
          )}{" "}
          facturas filtradas
        </span>
      </div>

      {/* Cuerpo */}
      {isLoading ? (
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-8 w-72 rounded-md" />
          <Skeleton className="h-8 w-48 rounded-md" />
        </div>
      ) : !data || data.byCurrency.length === 0 ? (
        <p className="text-xs text-muted-foreground">Sin resultados para agregar.</p>
      ) : (
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {data.byCurrency.map((row) => (
            <div key={row.moneda} className="flex items-center gap-3 flex-wrap">
              {/* Badge de moneda */}
              <Badge variant="outline" className="font-mono text-xs h-6 shrink-0">
                {row.moneda}
              </Badge>

              {/* Campos numéricos */}
              <div className="flex items-center gap-5 flex-wrap">
                {FIELDS.map(({ key, label, icon: Icon }) => {
                  const value = row[key];
                  if (value == null || value === 0) return null;
                  return (
                    <div key={key} className="flex items-center gap-1.5">
                      <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground">{label}:</span>
                      <Amount value={value} currency={row.moneda} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
