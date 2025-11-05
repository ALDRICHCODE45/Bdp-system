import { ConfigTabs } from "@/features/sistema/config/components/ConfigTabs";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";

export default function ConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-6">
      <TablePresentation
        subtitle="Configura y Administra el sistema en este apartado."
        title="Configuración"
      />
      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <ConfigTabs />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
