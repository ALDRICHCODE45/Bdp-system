"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error("Credenciales inválidas");
    }

    return result;
  };

  const logout = async () => {
    await signOut({ redirect: false });
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
