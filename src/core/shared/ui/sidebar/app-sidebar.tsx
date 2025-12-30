"use client";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/core/shared/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { sidebarLinks } from "./data/SidebarLinks";
import { useAuth } from "@/core/shared/hooks/use-auth";
import { usePermissions } from "@/core/shared/hooks/use-permissions";
import { filterSidebarLinks } from "./helpers/filterSidebarByPermissions";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { permissions } = usePermissions();

  const userData = user
    ? {
        name: user.name || "Usuario",
        email: user.email || "usuario@bdp.com",
        avatar: user.image || "/placeholder-avatar.jpg",
      }
    : {
        name: "Usuario",
        email: "usuario@bdp.com",
        avatar: "/placeholder-avatar.jpg",
      };

  // Filtrar los links del sidebar basándose en los permisos del usuario
  const filteredLinks = React.useMemo(() => {
    return filterSidebarLinks(sidebarLinks.navMain, permissions);
  }, [permissions]);

  return (
    <Sidebar collapsible="icon" {...props} variant="floating">
      <SidebarHeader>
        <NavUser user={userData} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredLinks} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
