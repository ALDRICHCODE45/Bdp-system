import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Landmark,
  Handshake,
  Headset,
  Monitor,
  Building2,
  Scale,
} from "lucide-react";

export const sidebarLinks = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Finanzas",
      url: "Finanzas",
      icon: Landmark,
      items: [
        {
          title: "Facturas",
          url: "/facturas",
        },
        {
          title: "Ingresos",
          url: "/ingresos",
        },
        {
          title: "Egresos",
          url: "/egresos",
        },

        {
          title: "Clientes/Proovedores",
          url: "/clientes-proovedores",
        },
      ],
    },
    {
      title: "RH",
      url: "RH",
      icon: Handshake,
      items: [
        {
          title: "Colaboradores",
          url: "/colaboradores",
        },
        {
          title: "Asistencias",
          url: "/asistencias",
        },
        {
          title: "Socios",
          url: "/socios",
        },
      ],
    },
    {
      title: "Recepción",
      url: "Recepción",
      icon: Headset,
      items: [
        {
          title: "Entradas y Salidas",
          url: "/entradas-salidas",
        },
        {
          title: "Registrar Entrada",
          url: "/qr-entry",
        },
      ],
    },
    {
      title: "Sistema",
      url: "Sistema",
      icon: Monitor,
      items: [
        {
          title: "Usuarios",
          url: "/usuarios",
        },
        {
          title: "Configuración",
          url: "/config",
        },
      ],
    },
  ],
};

export const teamsData = [
  {
    name: "GlobalServ",
    logo: Scale,
    plan: "Enterprise",
  },
  {
    name: "BDP",
    logo: Landmark,
    plan: "Startup",
  },
];
