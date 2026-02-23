"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { TryCatch } from "@/core/shared/helpers/tryCatch";
import { showToast } from "../helpers/CustomToast";

export function useAuth() {
  const { data: session, status } = useSession();
  const { setTheme } = useTheme();

  const login = async (email: string, password: string) => {
    const result = await TryCatch(
      signIn("credentials", {
        email,
        password,
        redirect: false,
      })
    );

    if (!result.ok || result.value?.error) {
      showToast({
        title: "Ocurrio un error",
        description: "Credenciales inválidas",
        type: "error",
      });
      throw new Error("Credenciales inválidas");
    }

    showToast({
      title: "Bienvenido",
      description: "Iniciaste Sesión Correctamente",
      type: "success",
    });
    return result.value;
  };

  const logout = async () => {
    // Resetear tema antes del redirect (para que se aplique)
    setTheme("light");

    // Forzar hard refresh para limpiar JWT y caché completamente
    // callbackUrl: redirige después del logout
    // redirect: true hace un hard refresh limpiando todas las cookies
    await signOut({
      redirect: true,
      callbackUrl: "/sign-in",
    });
  };

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  return {
    user: session?.user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
