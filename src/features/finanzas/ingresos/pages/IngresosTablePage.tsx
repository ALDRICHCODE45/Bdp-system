import { TablePresentation } from "@/core/shared/components/TablePresentation";

export const IngresosTablePage = () => {
  return (
    <>
      <section className="mx-auto max-w-[75vw] max-h-[100vh] py-10">
        <TablePresentation
          subtitle="¡Gestiona los ingresos en este apartado!"
          title="Ingresos"
        />

        {/* <DataTable columns={columns} data={colaboradoresMockData} /> */}
      </section>
    </>
  );
};
