import { LucideIcon, CheckCircle2, XCircle, LayoutGrid } from "lucide-react";
import type { MultiTabConfig } from "@/core/shared/components/DataTable/DataTableMultiTabs";
import type { FacturaStatusCounts } from "../server/actions/getFacturaStatusCountsAction";

export type FacturaStatus = "VIGENTE" | "CANCELADA";

export const FACTURA_TABS_CONFIG = [
  { id: "all",       label: "Todos",     icon: LayoutGrid,    statusFilter: null },
  { id: "vigente",   label: "Vigente",   icon: CheckCircle2,  statusFilter: "vigente" },
  { id: "cancelada", label: "Cancelada", icon: XCircle,       statusFilter: "cancelada" },
] as const;

const TAB_COUNT_KEY: Record<string, keyof FacturaStatusCounts> = {
  vigente:   "vigente",
  cancelada: "cancelada",
};

export function enrichFacturaTabsWithCounts(
  activeTabs: string[],
  statusCounts?: FacturaStatusCounts
): MultiTabConfig[] {
  const total = statusCounts
    ? statusCounts.vigente + statusCounts.cancelada
    : undefined;

  return FACTURA_TABS_CONFIG.map((tab) => {
    if (tab.id === "all") {
      return {
        id: tab.id,
        label: tab.label,
        icon: tab.icon as LucideIcon,
        count: activeTabs.length === 0 ? total : undefined,
      };
    }

    const countKey = TAB_COUNT_KEY[tab.id];
    const count = statusCounts && countKey ? statusCounts[countKey] : undefined;

    return {
      id: tab.id,
      label: tab.label,
      icon: tab.icon as LucideIcon,
      count,
    };
  });
}
