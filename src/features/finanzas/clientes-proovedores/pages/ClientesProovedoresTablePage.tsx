import { TablePresentation } from "@/core/shared/components/TablePresentation";

export const ClientesProovedoresTablePage = () => {
  return (
    <>
      <section className="mx-auto max-w-[75vw] max-h-[100vh] py-10">
        <TablePresentation
          subtitle="¡Gestiona los clientes y los proovedores en este apartado!"
          title="Clientes y Proovedores"
        />

        {/* <DataTable columns={columns} data={colaboradoresMockData} /> */}
      </section>
    </>
  );
};
