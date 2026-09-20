"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { TryCatch } from "@/core/shared/helpers/tryCatch";
import { showToast } from "../helpers/CustomToast";

export function useAuth() {
  const { data: session, status } = useSession();
  const { setTheme } = useTheme();

  /**
   * Second login step: exchanges the emailed single-use code for a NextAuth
   * session. The password step (`requestOtpAction`) always runs first and never
   * mints a session on its own — NextAuth only mints one after the code is
   * consumed by `authorize`.
   */
  const loginWithOtp = async (email: string, otp: string) => {
    const result = await TryCatch(
      signIn("credentials", {
        email,
        otp,
        redirect: false,
      }),
    );

    if (!result.ok || result.value?.error) {
      // Generic message: never reveal whether the account or the code was the
      // reason the verification failed.
      showToast({
        title: "No se pudo verificar",
        description: "El código es inválido o expiró.",
        type: "error",
      });
      throw new Error("El código es inválido o expiró.");
    }

    showToast({
      title: "Bienvenido",
      description: "Iniciaste sesión correctamente.",
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
    loginWithOtp,
    logout,
  };
}
