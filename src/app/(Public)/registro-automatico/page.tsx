import { Suspense } from "react";
import { RegisterEntryWithoutForm } from "@/features/RecursosHumanos/asistencias/pages/RegisterEntryWithoutForm";

const RegistroAutomatico = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Cargando...
        </div>
      }
    >
      <RegisterEntryWithoutForm />
    </Suspense>
  );
};

export default RegistroAutomatico;
