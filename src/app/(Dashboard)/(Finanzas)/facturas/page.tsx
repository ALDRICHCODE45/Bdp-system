import { FacturasTablePage } from "@/features/finanzas/facturas/pages/FacturasTablePage";
import { getPaginatedFacturasAction } from "@/features/finanzas/facturas/server/actions/getPaginatedFacturasAction";

/**
 * Server Component: prefetches the first page of facturas so the client
 * never has to show a skeleton on the initial render — the data arrives
 * already hydrated via initialData.
 */
export default async function FacturasPage() {
  const result = await getPaginatedFacturasAction({ page: 1, pageSize: 10 });
  const initialData = result.ok ? result.data : undefined;

  return <FacturasTablePage initialData={initialData} />;
}
