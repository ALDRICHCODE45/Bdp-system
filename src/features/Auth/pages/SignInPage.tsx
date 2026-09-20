"use client";
import * as React from "react";
import { SignInForm } from "../components/forms/SignInForm";
import { OtpVerificationForm } from "../components/forms/OtpVerificationForm";

/**
 * Two-step login shell: credentials (password → OTP request) then the OTP
 * verification step. The email is held only to display it and to submit the
 * code; the password is never retained after the request step.
 */
export const SignInPage = () => {
  const [pendingEmail, setPendingEmail] = React.useState<string | null>(null);

  if (pendingEmail) {
    return (
      <OtpVerificationForm
        email={pendingEmail}
        onBack={() => setPendingEmail(null)}
      />
    );
  }

  return <SignInForm onOtpRequested={setPendingEmail} />;
};
