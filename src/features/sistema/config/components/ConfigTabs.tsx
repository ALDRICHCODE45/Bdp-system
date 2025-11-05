"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/core/lib/utils";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { configTabs } from "../config/tabs.config";

export const ConfigTabs = () => {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Versión móvil: tabs horizontales con scroll
  if (isMobile) {
    return (
      <nav className="w-full">
        <div className="overflow-x-auto">
          <div className="flex gap-1 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 pb-2">
            {configTabs.map((tab) => {
              const isActive =
                pathname === tab.href || pathname.startsWith(`${tab.href}/`);

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap min-w-fit",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "touch-manipulation", // Mejora el rendimiento en móvil
                    isActive
                      ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  {tab.icon && <tab.icon className="h-4 w-4 flex-shrink-0" />}
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    );
  }

  // Versión desktop: tabs verticales
  return (
    <nav className="w-64 flex-shrink-0">
      <div className="space-y-1">
        {configTabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {tab.icon && <tab.icon className="h-4 w-4 flex-shrink-0" />}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
