import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/shared/ui/card";

export default function GeneralConfigPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>
            Ajusta las configuraciones generales del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aquí puedes configurar los parámetros generales del sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

