import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/core/shared/ui/card";
import { RegisterEntryForm } from "../components/forms/registerEntry.form";

export const RegisterManuallyEntradaSalidaPage = () => {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Registra tu Entrada/Salida</CardTitle>
        <CardDescription>
          Ingresa tu correo asignado a continuación:
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterEntryForm />
      </CardContent>
    </Card>
  );
};
