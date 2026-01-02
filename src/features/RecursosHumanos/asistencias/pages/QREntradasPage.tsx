"use client";
import Image from "next/image";
import { QRCode } from "@/core/shared/ui/qr-code";
import { Button } from "@/core/shared/ui/button";
import { useRouter } from "next/navigation";
import { Separator } from "@/core/shared/ui/separator";
import { Card, CardContent, CardFooter } from "@/core/shared/ui/card";

const QREntradasPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/signIn/logo.webp"
            alt="Logo BDP"
            width={300}
            height={300}
            className="dark:invert dark:brightness-200"
            priority
          />
        </div>

        {/* Título */}
        <div className="text-center ">
          <h1 className="text-4xl font-semibold tracking-tight">
            Registro de Asistencia
          </h1>
          <p className="text-lg text-muted-foreground">
            Escanea el código QR para registrar tu entrada o salida
          </p>
        </div>

        {/* QR Code */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 w-full">
          <Card className="w-md ">
            <CardContent>
              <QRCode data="https://bdp-system-production.up.railway.app/registro-automatico?tipo=Entrada" />
            </CardContent>
            <Separator />
            <CardFooter className="flex justify-center font-semibold">
              Entrada
            </CardFooter>
          </Card>

          <Card className="w-md ">
            <CardContent>
              <QRCode data="https://bdp-system-production.up.railway.app/registro-automatico?tipo=Salida" />
            </CardContent>
            <Separator />
            <CardFooter className="font-semibold flex justify-center ">
              Salida
            </CardFooter>
          </Card>
        </div>

        {/* Botón */}
        <div className="flex justify-center">
          <Button
            onClick={() => router.push("/register-qr-entry")}
            variant="outline"
            className="w-full max-w-sm text-sm"
          >
            Registrar manualmente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QREntradasPage;
