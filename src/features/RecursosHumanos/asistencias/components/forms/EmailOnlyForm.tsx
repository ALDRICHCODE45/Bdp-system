"use client";

import { Button } from "@/core/shared/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/core/shared/ui/field";
import { Input } from "@/core/shared/ui/input";
import { useEmailOnlyForm } from "../../hooks/useEmailOnlyForm.hook";

type TipoAsistencia = "Entrada" | "Salida";

interface EmailOnlyFormProps {
  tipo: TipoAsistencia;
  onSuccess?: () => void;
}

export const EmailOnlyForm = ({ tipo, onSuccess }: EmailOnlyFormProps) => {
  const form = useEmailOnlyForm({ tipo, onSuccess });

  return (
    <>
      <form
        id="email-only-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Correo electrónico
                  </FieldLabel>
                  <FieldDescription>
                    Ingresa tu correo electrónico para registrar tu{" "}
                    {tipo.toLowerCase()}.
                  </FieldDescription>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="user@bdp.com"
                    autoComplete="email"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </form>
      <Field orientation="horizontal" className="mt-4">
        <Button type="submit" className="w-full" form="email-only-form">
          Registrar {tipo}
        </Button>
      </Field>
    </>
  );
};
