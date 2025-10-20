import { TablePresentation } from "@/core/shared/components/TablePresentation";

export const EgresosTablePage = () => {
  return (
    <>
      <section className="mx-auto max-w-[75vw] max-h-[100vh] py-10">
        <TablePresentation
          subtitle="¡Gestiona los egresos en este apartado!"
          title="Egresos"
        />

        {/* <DataTable columns={columns} data={colaboradoresMockData} /> */}
      </section>
    </>
  );
};
