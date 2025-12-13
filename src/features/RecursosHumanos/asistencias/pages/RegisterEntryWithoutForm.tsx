"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { EmailOnlyForm } from "../components/forms/EmailOnlyForm";
import { RegistroSuccessDialog } from "../components/RegistroSuccessDialog";
import { useAutoRegisterEntry } from "../hooks/useAutoRegisterEntry.hook";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/shared/ui/card";

type TipoAsistencia = "Entrada" | "Salida";

export const RegisterEntryWithoutForm = () => {
  const searchParams = useSearchParams();
  const tipo = searchParams.get("tipo") as TipoAsistencia | null;

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isFormSuccess, setIsFormSuccess] = useState(false);
  const hasAutoRegistered = useRef(false);

  const {
    state,
    email,
    hasEmail,
    tipo: tipoRegistro,
    register,
    reset,
  } = useAutoRegisterEntry({
    tipo: tipo ?? "Entrada",
  });

  // Auto-registro cuando ya existe email en localStorage (solo una vez)
  useEffect(() => {
    if (hasEmail && tipo && !hasAutoRegistered.current) {
      hasAutoRegistered.current = true;
      setShowSuccessDialog(true);
      register();
    }
  }, [hasEmail, tipo, register]);

  // Callback cuando el formulario de email tiene éxito
  const handleFormSuccess = () => {
    setIsFormSuccess(true);
    setShowSuccessDialog(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setShowSuccessDialog(false);
      reset();
    }
  };

  const handleRetry = () => {
    register();
  };

  // Si no hay tipo en params, mostrar error
  if (!tipo) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-destructive">
          Error: No se especificó el tipo de registro.
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          El enlace debe incluir ?tipo=Entrada o ?tipo=Salida
        </p>
      </div>
    );
  }

  // Si ya tiene email, mostrar solo el dialog (registro automático)
  if (hasEmail) {
    return (
      <RegistroSuccessDialog
        open={showSuccessDialog}
        onOpenChange={handleDialogClose}
        state={state}
        tipo={tipoRegistro}
        email={email}
        onRetry={handleRetry}
      />
    );
  }

  // Si no tiene email, mostrar formulario solo con campo email
  return (
    <>
      <section className="w-full h-[100vh] p-3  flex flex-col justify-center">
        <Card>
          <CardHeader className="text-lg font-semibold text-center">
            <CardTitle>Registrar {tipo}</CardTitle>
          </CardHeader>
          <CardContent>
            <EmailOnlyForm tipo={tipo} onSuccess={handleFormSuccess} />
          </CardContent>
        </Card>
      </section>

      {/* Dialog para mostrar resultado después de enviar el formulario */}
      {isFormSuccess && (
        <RegistroSuccessDialog
          open={showSuccessDialog}
          onOpenChange={handleDialogClose}
          state="success"
          tipo={tipo}
          email={email}
        />
      )}
    </>
  );
};
