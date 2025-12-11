"use client";
import { QRCode } from "@/components/ui/shadcn-io/qr-code";
import { Button } from "@/core/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/core/shared/ui/card";
import { useRouter } from "next/navigation";

const QREntradasPage = () => {
  const router = useRouter();

  return (
    <>
      <Card className="text-center">
        <CardHeader>Escanea para registrar tu entrada o salida.</CardHeader>
        <CardContent>
          <section className="w-full max-w-2xl mx-auto flex justify-center items-center border border-gray rounded-lg">
            <QRCode data="http://192.168.100.14:3000/register-qr-entry" />
          </section>
          <div className="mt-5">
            <Button
              onClick={() => {
                router.push("/register-qr-entry");
              }}
              variant={"default"}
            >
              Registrar manualmente
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default QREntradasPage;
