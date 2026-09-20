"use client";
import { useForm } from "@tanstack/react-form";
import { showToast } from "@/core/shared/helpers/CustomToast";
import { userLoginSchema } from "@/features/Auth/schemas/userLogin.schema";
import { requestOtpAction } from "@/features/Auth/server/actions/requestOtpAction";

/**
 * First login step: proves email + password and asks the server to email a
 * single-use OTP. No session is created here; `onOtpRequested` only advances
 * the page to the OTP step, and NextAuth issues the JWT after the code is
 * consumed by `authorize`.
 */
export function useSignInForm(onOtpRequested: (email: string) => void) {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: userLoginSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await requestOtpAction({
        email: value.email,
        password: value.password,
      });

      if (!result.ok) {
        // The action returns a generic message for every rejection (wrong
        // password, inactive account, throttle, delivery failure), so it is
        // safe to surface verbatim and never enumerates accounts.
        showToast({
          type: "error",
          title: "No se pudo iniciar sesión",
          description: result.error,
        });
        throw new Error(result.error);
      }

      onOtpRequested(value.email.trim().toLowerCase());
    },
  });

  return form;
}
