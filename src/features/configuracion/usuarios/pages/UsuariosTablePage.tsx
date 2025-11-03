import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";

export const UsuariosTablePage = () => {
  return (
    <>
      <div className="container mx-auto py-6">
        <TablePresentation
          subtitle="Administra y filtra los usuarios de la aplicacion"
          title="Gestión de Usuarios"
        />
      </div>
    </>
  );
};
