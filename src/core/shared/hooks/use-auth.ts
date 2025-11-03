"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { TryCatch } from "@/core/shared/helpers/tryCatch";
import { showToast } from "../helpers/CustomToast";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
    await signOut({ redirect: false });
    setTheme("light");

    router.push("/sign-in");
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
