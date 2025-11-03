import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Landmark,
  Handshake,
  Cog,
  Headset,
} from "lucide-react";

export const sidebarLinks = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
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
      ],
    },
    {
      title: "Configuracion",
      url: "Configuracion",
      icon: Cog,
      items: [
        {
          title: "Usuarios",
          url: "/usuarios",
        },
      ],
    },
  ],
};
