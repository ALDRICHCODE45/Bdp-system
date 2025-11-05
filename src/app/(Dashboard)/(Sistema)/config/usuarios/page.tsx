import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/shared/ui/card";

export default function UsuariosConfigPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Usuarios</CardTitle>
          <CardDescription>
            Gestiona la configuración relacionada con usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aquí puedes configurar los parámetros relacionados con usuarios del sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

