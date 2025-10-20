import { TablePresentation } from "@/core/shared/components/TablePresentation";

export const FacturasTablePage = () => {
  return (
    <>
      <section className="mx-auto max-w-[75vw] max-h-[100vh] py-10">
        <TablePresentation
          subtitle="¡Gestiona las facturas en este apartado!"
          title="Facturas"
        />

        {/* <DataTable columns={columns} data={colaboradoresMockData} /> */}
      </section>
    </>
  );
};
