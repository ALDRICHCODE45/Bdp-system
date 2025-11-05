import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/ui/card";

export default function NotificacionesConfigPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Notificaciones</CardTitle>
          <CardDescription>
            Gestiona las notificaciones del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aquí puedes configurar las notificaciones del sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
