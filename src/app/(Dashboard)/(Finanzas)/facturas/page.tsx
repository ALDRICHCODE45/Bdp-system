import { FacturasTablePage } from "@/features/finanzas/facturas/pages/FacturasTablePage";
import { getPaginatedFacturasAction } from "@/features/finanzas/facturas/server/actions/getPaginatedFacturasAction";
import { auth } from "@/core/lib/auth/auth";
import { isCapturadorOnly } from "@/features/finanzas/facturas/helpers/capturadorUtils";

/**
 * Server Component: prefetches the first page of facturas so the client
 * never has to show a skeleton on the initial render — the data arrives
 * already hydrated via initialData.
 *
 * También detecta si el usuario es Capturador y pasa `isCapturador` al
 * componente de página para restringir la UI en consecuencia.
 */
export default async function FacturasPage() {
  const session = await auth();
  const userPermissions = session?.user?.permissions ?? [];
  const capturador = isCapturadorOnly(userPermissions);

  const result = await getPaginatedFacturasAction({ page: 1, pageSize: 10 });
  const initialData = result.ok ? result.data : undefined;

  return <FacturasTablePage initialData={initialData} isCapturador={capturador} />;
}
