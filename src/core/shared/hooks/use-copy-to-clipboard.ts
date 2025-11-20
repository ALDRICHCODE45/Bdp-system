"use client";

import { useState, useCallback } from "react";

export const useCopyToClipboard = () => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      setError(null);

      if (!text) {
        throw new Error("No se proporcionó texto para copiar");
      }

      // Verificar si la API del portapapeles está disponible
      if (!navigator.clipboard) {
        // Fallback para navegadores antiguos
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand("copy");
          if (!successful) {
            throw new Error("No se pudo copiar al portapapeles");
          }
        } finally {
          document.body.removeChild(textArea);
        }
      } else {
        // Usar la API moderna del portapapeles
        await navigator.clipboard.writeText(text);
      }

      setCopied(true);

      // Resetear el estado después de 2 segundos
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Error desconocido al copiar");
      setError(error);
      setCopied(false);
    }
  }, []);

  return {
    copyToClipboard,
    copied,
    error,
  };
};
