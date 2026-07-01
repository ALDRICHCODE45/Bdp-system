import {
  LayoutGrid,
  UserCheck,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MultiTabConfig } from "@/core/shared/components/DataTable/DataTableMultiTabs";

/**
 * Tab configuration for the colaboradores slim table (cap1 req2).
 *
 * - id "all"         → empty status[] (Todos, no filter)
 * - id "contratado"  → status = ["CONTRATADO"]     (Activos)
 * - id "en_licencia" → status = ["EN_LICENCIA"]    (En licencia)
 *
 * "DESPEDIDO" rows surface only under "Todos" by design — no dedicated tab.
 */
export type ColaboradorTabId = "all" | "contratado" | "en_licencia";

export const COLABORADOR_TABS_BASE = [
  {
    id: "all" as const,
    label: "Todos",
    icon: LayoutGrid,
    statusFilter: null,
  },
  {
    id: "contratado" as const,
    label: "Activos",
    icon: UserCheck,
    statusFilter: "CONTRATADO" as const,
  },
  {
    id: "en_licencia" as const,
    label: "En licencia",
    icon: Clock,
    statusFilter: "EN_LICENCIA" as const,
  },
];

export type ColaboradorStatusCounts = {
  CONTRATADO: number;
  DESPEDIDO: number;
  EN_LICENCIA: number;
};

/**
 * Materialize tab config with live counts from the groupBy query.
 * The "all" tab shows the total (sum of all statuses) when no filter is active,
 * matching Facturas' enrichFacturaTabsWithCounts pattern.
 */
export function enrichColaboradorTabsWithCounts(
  activeTabs: string[],
  counts?: ColaboradorStatusCounts,
): MultiTabConfig[] {
  const total = counts
    ? counts.CONTRATADO + counts.DESPEDIDO + counts.EN_LICENCIA
    : undefined;

  return COLABORADOR_TABS_BASE.map((tab) => {
    if (tab.id === "all") {
      return {
        id: tab.id,
        label: tab.label,
        icon: tab.icon as LucideIcon,
        count: activeTabs.length === 0 ? total : undefined,
      };
    }
    const count = counts ? counts[tab.statusFilter] : undefined;
    return {
      id: tab.id,
      label: tab.label,
      icon: tab.icon as LucideIcon,
      count,
    };
  });
}

/** Map activeTab ids → status[] filter for the server query. */
export function tabIdsToStatusFilter(activeTabs: string[]):
  | ("CONTRATADO" | "EN_LICENCIA")[]
  | undefined {
  const map: Record<string, "CONTRATADO" | "EN_LICENCIA"> = {
    contratado: "CONTRATADO",
    en_licencia: "EN_LICENCIA",
  };
  const statuses: ("CONTRATADO" | "EN_LICENCIA")[] = [];
  for (const id of activeTabs) {
    const s = map[id];
    if (s) statuses.push(s);
  }
  return statuses.length > 0 ? statuses : undefined;
}