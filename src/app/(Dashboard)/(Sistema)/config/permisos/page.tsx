import { RolesTablePage } from "@/features/sistema/config/roles/pages/RolesTablePage";
import { getRolesAction } from "@/features/sistema/config/roles/server/actions/getRolesAction";

const PermisosConfigPage = async () => {
  const result = await getRolesAction();

  if (!result.ok) {
    return (
      <div className="space-y-6">
        <div className="text-red-500">
          Error al cargar roles: {result.error}
        </div>
      </div>
    );
  }

  return <RolesTablePage tableData={result.data} />;
};

export default PermisosConfigPage;
