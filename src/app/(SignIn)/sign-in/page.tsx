import { Button } from "@/core/shared/ui/button";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldSeparator,
} from "@/core/shared/ui/field";
import { Input } from "@/core/shared/ui/input";

const SignIn = () => {
  return (
    <>
      <form className="flex flex-col gap-6">
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Inicia sesión en tu cuenta</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Ingresa tus datos
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@ejemplo.com"
              required
            />
          </Field>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            </div>
            <Input id="password" type="password" required />
          </Field>
          <Field>
            <Button type="submit">Iniciar sesión</Button>
          </Field>
          <FieldSeparator>By BDP</FieldSeparator>
        </FieldGroup>
      </form>
    </>
  );
};

export default SignIn;
