"use client";

import { TablePresentation } from "@/core/shared/components/TablePresentation";

export default function ClientesProveedoresTablePage() {
  return (
    <section className="mx-auto max-w-[75vw] max-h-[100vh] py-10">
      <TablePresentation
        subtitle="Gestión de clientes y proveedores del sistema"
        title="Clientes y Proovedores"
      />

      {/* <DataTable columns={columns} data={colaboradoresMockData} /> */}
    </section>
  );
}
