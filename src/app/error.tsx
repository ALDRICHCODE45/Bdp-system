"use client";
import { Button } from "@/core/shared/ui/button";
import Link from "next/link";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <section className="w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">
          500
        </h1>
        <p className="mb-4 text-3xl tracking-tight font-bold md:text-4xl">
          Algo salió mal.
        </p>
        <p className="mb-4 w-lg text-lg font-light text-gray-500 dark:text-muted-foreground">
          Lo sentimos, ha ocurrido un error interno en el servidor. Por favor,
          intenta nuevamente más tarde o vuelve a la página principal.
        </p>
        <div className="flex flex-col md:flex-row  gap-3">
          <Button
            asChild
            className="hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900"
            variant="outline"
          >
            <Link href="/">Inicio</Link>
          </Button>

          <Button
            className="hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 "
            onClick={() => {
              reset();
            }}
          >
            Reintentar
          </Button>
        </div>
      </div>
    </section>
  );
}
