"use client";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/core/shared/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/core/shared/ui/field";
import { Input } from "@/core/shared/ui/input";
import { Button } from "@/core/shared/ui/button";
import { useAuth } from "@/core/shared/hooks/use-auth";
import {
  otpCodeFormSchema,
  OTP_CODE_TTL_MINUTES,
} from "@/features/Auth/schemas/otp.schema";

type OtpVerificationFormProps = {
  email: string;
  onBack: () => void;
};

/**
 * Second login step: submits the emailed one-time code to NextAuth, which
 * consumes it in `authorize` before issuing the session. On failure the user
 * stays on this step with a generic error (via `useAuth`).
 */
export function OtpVerificationForm({
  email,
  onBack,
}: OtpVerificationFormProps) {
  const { loginWithOtp } = useAuth();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      code: "",
    },
    validators: {
      onSubmit: otpCodeFormSchema,
    },
    onSubmit: async ({ value }) => {
      await loginWithOtp(email, value.code);
      router.push("/");
    },
  });

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Verifica tu correo</CardTitle>
        <CardDescription>
          Enviamos un código de 6 dígitos a{" "}
          <span className="font-medium">{email}</span>. Vence en{" "}
          {OTP_CODE_TTL_MINUTES} minutos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="otp-verification-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="code">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Código de verificación
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="000000"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Field orientation="horizontal">
          <Button
            type="submit"
            className="w-full"
            form="otp-verification-form"
            disabled={form.state.isSubmitting}
          >
            {form.state.isSubmitting ? "Verificando..." : "Verificar código"}
          </Button>
        </Field>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBack}
          disabled={form.state.isSubmitting}
        >
          Volver
        </Button>
      </CardFooter>
    </Card>
  );
}
