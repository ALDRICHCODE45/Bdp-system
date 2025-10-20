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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} variant="floating">
      <SidebarHeader>
        <NavUser user={sidebarLinks.user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarLinks.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
