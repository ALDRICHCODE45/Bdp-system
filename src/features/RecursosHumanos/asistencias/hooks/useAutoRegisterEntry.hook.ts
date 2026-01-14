"use client";

import { useState, useEffect, useCallback } from "react";
import { showToast } from "@/core/shared/helpers/CustomToast";
import { createAsistenciaPublicAction } from "../server/actions/createAsistenciaPublicAction.action";
import { getLocalStorageItem } from "@/core/shared/helpers/localStorage.helper";

type TipoAsistencia = "Entrada" | "Salida";

type RegistroState = "idle" | "loading" | "success" | "error";

interface UseAutoRegisterEntryOptions {
  tipo: TipoAsistencia;
}

interface UseAutoRegisterEntryReturn {
  state: RegistroState;
  email: string;
  hasEmail: boolean;
  tipo: TipoAsistencia;
  register: () => Promise<void>;
  reset: () => void;
}

export const useAutoRegisterEntry = ({
  tipo,
}: UseAutoRegisterEntryOptions): UseAutoRegisterEntryReturn => {
  const [state, setState] = useState<RegistroState>("idle");
  const [email, setEmail] = useState<string>("");
  const [hasEmail, setHasEmail] = useState<boolean>(false);

  useEffect(() => {
    const storedEmail = getLocalStorageItem<string>("correo", "");
    setEmail(storedEmail);
    setHasEmail(!!storedEmail);
  }, []);

  const register = useCallback(async () => {
    if (!email || state === "loading") return;

    setState("loading");

    try {
      const args = {
        correo: email,
        tipo,
        fecha: new Date(),
      };

      const result = await createAsistenciaPublicAction(args);

      if (result && !result.ok) {
        setState("error");
        showToast({
          title: `La ${tipo} no se pudo registrar`,
          description: result.message || "Intenta de nuevo mas tarde!",
          type: "error",
        });
        return;
      }

      setState("success");
      showToast({
        title: `${tipo} Registrada satisfactoriamente`,
        description: "Que tengas Excelente dia!",
        type: "success",
      });
    } catch (error) {
      console.error("Error registering attendance:", error);
      setState("error");
      showToast({
        title: "Error al registrar",
        description: "Error desconocido. Intenta de nuevo.",
        type: "error",
      });
    }
  }, [email, tipo, state]);

  const reset = useCallback(() => {
    setState("idle");
  }, []);

  return {
    state,
    email,
    hasEmail,
    tipo,
    register,
    reset,
  };
};
