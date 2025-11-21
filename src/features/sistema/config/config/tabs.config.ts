import { Settings, Shield, Bell, Building2 } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export interface ConfigTab {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
}

export const configTabs: ConfigTab[] = [
  {
    id: "permisos",
    label: "Roles y Permisos",
    href: "/config/permisos",
    icon: Shield,
  },
  {
    id: "empresa",
    label: "Empresa",
    href: "/config/empresa",
    icon: Building2,
  },
  {
    id: "general",
    label: "General",
    href: "/config/general",
    icon: Settings,
  },
  {
    id: "notificaciones",
    label: "Notificaciones",
    href: "/config/notificaciones",
    icon: Bell,
  },
];
