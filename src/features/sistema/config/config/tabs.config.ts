import { Settings, Users, Shield, Bell } from "lucide-react";
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
    id: "general",
    label: "General",
    href: "/config/general",
    icon: Settings,
  },
  {
    id: "usuarios",
    label: "Usuarios",
    href: "/config/usuarios",
    icon: Users,
  },
  {
    id: "notificaciones",
    label: "Notificaciones",
    href: "/config/notificaciones",
    icon: Bell,
  },
];
