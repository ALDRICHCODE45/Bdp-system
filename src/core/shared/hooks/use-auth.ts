"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { TryCatch } from "@/core/shared/helpers/tryCatch";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setTheme } = useTheme();

  const login = async (email: string, password: string) => {
    const [result, error] = await TryCatch(
      signIn("credentials", {
        email,
        password,
        redirect: false,
      })
    );

    if (error || result?.error) {
      toast.error("Credenciales inválidas");
      throw new Error("Credenciales inválidas");
    }

    toast.success("Iniciaste Sesión Correctamente");

    return result;
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
