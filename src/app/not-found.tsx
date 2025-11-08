import { Button } from "@/core/shared/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">
          401
        </h1>
        <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl">
          No tienes los privilegios para acceder a esta ruta
        </p>
        <p className="mb-4 w-lg text-lg font-light text-gray-500 dark:text-gray-400">
          Lo sentimos, no puedes acceder a esta página. Hay mucho por explorar
          en la página principal.
        </p>
        <Button
          asChild
          className="hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4"
          variant="outline"
        >
          <Link href="/">Volver a la página principal</Link>
        </Button>
      </div>
    </section>
  );
}
