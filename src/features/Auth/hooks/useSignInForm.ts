"use client";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/shared/hooks/use-auth";
import { TryCatch } from "@/core/shared/helpers/tryCatch";
import { userLoginSchema } from "@/features/Auth/schemas/userLogin.schema";

export function useSignInForm() {
  const { login } = useAuth();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onBlur: userLoginSchema,
    },
    onSubmit: async ({ value }) => {
      const [_data, error] = await TryCatch(login(value.email, value.password));

      if (error) {
        //Cambiar esta línea por un logger
        console.error("Error en login:", error);
        throw new Error("Error al iniciar sesión");
      }

      //TODO: Cambiar '/facturas' por la ruta para redirigir al
      //usuario basado en su rol
      router.push("/facturas");
    },
  });

  return form;
}
