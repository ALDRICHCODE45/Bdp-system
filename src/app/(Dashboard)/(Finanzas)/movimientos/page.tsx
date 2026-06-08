import { Card, CardContent, CardHeader, CardTitle } from "@/core/shared/ui/card";

/**
 * Placeholder server page for the unified Movimientos route.
 * Real content (MovimientosTablePage) will be wired in T15.
 */
export default async function MovimientosPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Ingresos / Egresos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Modulo unificado de movimientos — proximamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
