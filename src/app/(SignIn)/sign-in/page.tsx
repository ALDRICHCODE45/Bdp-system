"use client";

import { Button } from "@/core/shared/ui/button";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldSeparator,
} from "@/core/shared/ui/field";
import { Input } from "@/core/shared/ui/input";
import { useAuth } from "@/core/shared/hooks/use-auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SignIn = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/facturas");
    } catch {
      setError("Credenciales inválidas. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Inicia sesión en tu cuenta</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Ingresa tus datos
            </p>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="admin@bdp.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="admin123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </Field>
          <FieldSeparator>By BDP</FieldSeparator>

          {/* TODO: Credenciales de prueba */}
          <div className="text-xs text-muted-foreground text-center">
            <p>Credenciales de prueba:</p>
            <p>Email: admin@bdp.com</p>
            <p>Password: admin123</p>
          </div>
        </FieldGroup>
      </form>
    </>
  );
};

export default SignIn;
