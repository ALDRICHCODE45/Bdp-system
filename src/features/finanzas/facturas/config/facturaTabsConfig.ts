import { LucideIcon, FileText, Send, CreditCard, XCircle, LayoutGrid } from "lucide-react";
import type { MultiTabConfig } from "@/core/shared/components/DataTable/DataTableMultiTabs";

export type FacturaStatus = "BORRADOR" | "ENVIADA" | "PAGADA" | "CANCELADA";

export const FACTURA_TABS_CONFIG = [
  { id: "all",       label: "Todos",     icon: LayoutGrid, statusFilter: null },
  { id: "borrador",  label: "Borrador",  icon: FileText,   statusFilter: "borrador" },
  { id: "enviada",   label: "Enviada",   icon: Send,       statusFilter: "enviada" },
  { id: "pagada",    label: "Pagada",    icon: CreditCard, statusFilter: "pagada" },
  { id: "cancelada", label: "Cancelada", icon: XCircle,    statusFilter: "cancelada" },
] as const;

export function enrichFacturaTabsWithCounts(
  activeTabs: string[],
  totalCount: number
): MultiTabConfig[] {
  return FACTURA_TABS_CONFIG.map((tab) => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon as LucideIcon,
    count: activeTabs.includes(tab.id) || (activeTabs.length === 0 && tab.id === "all")
      ? totalCount
      : undefined,
  }));
}
