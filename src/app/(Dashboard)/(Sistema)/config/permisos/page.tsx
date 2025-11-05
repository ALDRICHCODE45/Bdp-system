import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/shared/ui/card";

export default function PermisosConfigPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Permisos</CardTitle>
          <CardDescription>
            Gestiona los permisos y roles del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aquí puedes configurar los permisos y roles del sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

