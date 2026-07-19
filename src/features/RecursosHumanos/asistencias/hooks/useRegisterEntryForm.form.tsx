"use client";

import { showToast } from "@/core/shared/helpers/CustomToast";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { createAsistenciaSchema } from "../schemas/createAsistenciaSchema.schema";
import { createAsistenciaAction } from "../server/actions/createAsistenciaAction.action";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "@/core/shared/helpers/localStorage.helper";
import { useSearchParams } from "next/navigation";

export const useRegisterEntryForm = () => {
  const queryClient = useQueryClient();
  const queryParameters = useSearchParams();
  const tipo = queryParameters.get("tipo") ?? undefined;

  const userEmail = getLocalStorageItem("correo", "");
  const form = useForm({
    defaultValues: {
      email: userEmail,
      tipo: tipo,
    },
    validators: {
      onSubmit: createAsistenciaSchema,
    },
    onSubmit: async ({ value }) => {
      //setear el correo en localStorage
      setLocalStorageItem("correo", value.email);

      const args = {
        correo: value.email,
        tipo: value.tipo as "Entrada" | "Salida",
        fecha: new Date(),
      };
      const result = await createAsistenciaAction(args);
      if (result && !result.ok) {
        showToast({
          title: `La ${value.tipo} no se pudo registrar`,
          description:
            "Intenta de nuevo mas tarde! o contacta al equipo de Desarrollo",
          type: "error",
        });
        value.email = "";
        return;
      }

      // Refrescar la tabla de asistencias en el cliente. La Server Action
      // hace revalidatePath (caché de RSC), pero la tabla se hidrata vía
      // TanStack Query, que con staleTime de 5 min no vuelve a pedir datos
      // por su cuenta. Invalidamos su caché para forzar el refetch.
      //
      // Fire-and-forget a propósito: el registro ya se confirmó arriba. Si el
      // refetch en segundo plano fallara, no debe convertir este éxito en un
      // toast de error, así que no lo esperamos (await).
      void queryClient.invalidateQueries({ queryKey: ["asistencias"] });

      showToast({
        title: `${value.tipo} Registrada satisfactoriamente`,
        description: "Que tengas Excelente dia!",
        type: "success",
      });
      //resetear valores
      value.email = "";
    },
  });
  return form;
};
