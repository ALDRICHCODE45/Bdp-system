"use client";
import Image from "next/image";
import { QRCode } from "@/components/ui/shadcn-io/qr-code";
import { Button } from "@/core/shared/ui/button";
import { useRouter } from "next/navigation";

const QREntradasPage = () => {
  const router = useRouter();

  return (
    <div className=" flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8">
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
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">
            Registro de Asistencia
          </h1>
          <p className="text-lg text-muted-foreground">
            Escanea el código QR para registrar tu entrada o salida
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center ">
          <div className="p-4 bg-white rounded-xl shadow-sm w-sm">
            <QRCode data="http://192.168.100.14:3000/register-qr-entry" />
          </div>
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
