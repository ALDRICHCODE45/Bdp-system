"use client";

import { ScrollArea, ScrollBar } from "@/core/shared/ui/scroll-area";
import { cn } from "@/core/lib/utils";
import { LucideIcon } from "lucide-react";

export interface MultiTabConfig {
  id: string;
  label: string;
  count?: number;
  icon: LucideIcon;
}

interface DataTableMultiTabsProps {
  tabs: MultiTabConfig[];
  activeTabs: string[];
  onTabsChange: (ids: string[]) => void;
  /** ID of the "all" tab that clears selection (default: "all") */
  allTabId?: string;
}

export function DataTableMultiTabs({
  tabs,
  activeTabs,
  onTabsChange,
  allTabId = "all",
}: DataTableMultiTabsProps) {
  const handleClick = (tabId: string) => {
    if (tabId === allTabId) {
      onTabsChange([]);
      return;
    }

    if (activeTabs.includes(tabId)) {
      onTabsChange(activeTabs.filter((id) => id !== tabId));
    } else {
      onTabsChange([...activeTabs, tabId]);
    }
  };

  const isActive = (tabId: string) => {
    if (tabId === allTabId) return activeTabs.length === 0;
    return activeTabs.includes(tabId);
  };

  const activeClass =
    "text-primary border-primary border-b-2";
  const inactiveClass =
    "text-muted-foreground border-transparent hover:text-primary";

  const renderTab = (tab: MultiTabConfig) => {
    const Icon = tab.icon;
    const active = isActive(tab.id);
    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => handleClick(tab.id)}
        className={cn(
          "inline-flex items-center gap-1.5 px-0 py-3 flex-shrink-0 rounded-none border-0 border-b-2 bg-transparent transition-colors cursor-pointer text-sm font-medium",
          active ? activeClass : inactiveClass,
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            active ? "text-primary" : "text-muted-foreground",
          )}
        />
        {tab.label}
        {tab.count !== undefined && (
          <span
            className={cn(
              "ml-1 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium",
              active
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            {tab.count}
          </span>
        )}
      </button>
    );
  };

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-6 min-w-fit border-b border-border">
        {tabs.map(renderTab)}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
