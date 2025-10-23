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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  // TODO: Manejar el caso cuando user es null/undefined
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

  return (
    <Sidebar collapsible="icon" {...props} variant="floating">
      <SidebarHeader>
        <NavUser user={userData} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarLinks.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
