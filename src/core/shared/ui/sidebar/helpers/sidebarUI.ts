import { LucideIcon } from "lucide-react";

class SidebarHelpers {
  static isParentActive(
    pathname: string,
    item: {
      title: string;
      url: string;
      icon?: LucideIcon;
      items?: { title: string; url: string }[];
    }
  ): boolean {
    return item.items?.some((subItem) => pathname === subItem.url) ?? false;
  }

  static isSubItemActive(pathname: string, subItemUrl: string): boolean {
    return pathname === subItemUrl;
  }
}

export const sidebarHelpers = {
  isParentActive: SidebarHelpers.isParentActive,
  isSubItemActive: SidebarHelpers.isSubItemActive,
};
