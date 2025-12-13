import { Suspense } from "react";
import { RegisterManuallyEntradaSalidaPage } from "@/features/RecursosHumanos/asistencias/pages/RegisterManuallyEntradaSalida.page";

const RegisterQrEntryPage = () => {
  return (
    <div className="w-full h-[100vh] mx-auto flex justify-center items-center tex-center">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">Cargando...</div>
        }
      >
        <RegisterManuallyEntradaSalidaPage />
      </Suspense>
    </div>
  );
};

export default RegisterQrEntryPage;
