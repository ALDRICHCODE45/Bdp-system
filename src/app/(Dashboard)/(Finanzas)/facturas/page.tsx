import { getAllFacturasAction } from "@/features/finanzas/facturas/server/actions/getAllFacturasAction";
import { FacturasTablePage } from "@/features/finanzas/facturas/pages/FacturasTablePage";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export default async function FacturasPage() {
  const queryClient = new QueryClient();

  const result = await getAllFacturasAction();
  const tableData = result.ok ? result.data : [];

  await queryClient.prefetchQuery({
    queryKey: ["facturas"],
    queryFn: async () => tableData,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FacturasTablePage tableData={tableData || []} />
    </HydrationBoundary>
  );
}
