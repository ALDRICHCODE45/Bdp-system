import { LucideIcon, FileText, Send, CreditCard, XCircle, LayoutGrid } from "lucide-react";
import type { MultiTabConfig } from "@/core/shared/components/DataTable/DataTableMultiTabs";
import type { FacturaStatusCounts } from "../server/actions/getFacturaStatusCountsAction";

export type FacturaStatus = "BORRADOR" | "ENVIADA" | "PAGADA" | "CANCELADA";

export const FACTURA_TABS_CONFIG = [
  { id: "all",       label: "Todos",     icon: LayoutGrid, statusFilter: null },
  { id: "borrador",  label: "Borrador",  icon: FileText,   statusFilter: "borrador" },
  { id: "enviada",   label: "Enviada",   icon: Send,       statusFilter: "enviada" },
  { id: "pagada",    label: "Pagada",    icon: CreditCard, statusFilter: "pagada" },
  { id: "cancelada", label: "Cancelada", icon: XCircle,    statusFilter: "cancelada" },
] as const;

/** Mapa de tabId → clave en FacturaStatusCounts */
const TAB_COUNT_KEY: Record<string, keyof FacturaStatusCounts> = {
  borrador:  "borrador",
  enviada:   "enviada",
  pagada:    "pagada",
  cancelada: "cancelada",
};

/**
 * Enriquece los tabs con conteos independientes por status.
 *
 * - "Todos": muestra la suma de todos los estados
 * - Cada status tab: muestra su propio conteo (respeta demás filtros activos)
 */
export function enrichFacturaTabsWithCounts(
  activeTabs: string[],
  statusCounts?: FacturaStatusCounts
): MultiTabConfig[] {
  const total = statusCounts
    ? statusCounts.borrador + statusCounts.enviada + statusCounts.pagada + statusCounts.cancelada
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
      // Siempre mostrar el conteo individual de cada status (no solo cuando está activo)
      count,
    };
  });
}
