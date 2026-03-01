"use client";
import { Badge } from "@/core/shared/ui/badge";
import { cn } from "@/core/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  borrador:
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-0",
  enviada:
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-0",
  pagada:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0",
  cancelada:
    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0",
};

const STATUS_LABELS: Record<string, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  pagada: "Pagada",
  cancelada: "Cancelada",
};

export function FacturaStatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  return (
    <Badge
      variant="secondary"
      className={cn("text-xs capitalize rounded-xs ", STATUS_STYLES[key])}
    >
      {STATUS_LABELS[key] ?? status}
    </Badge>
  );
}
