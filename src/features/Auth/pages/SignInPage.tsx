"use client";
import * as React from "react";
import { SignInForm } from "../components/forms/SignInForm";
import { OtpVerificationForm } from "../components/forms/OtpVerificationForm";
import {
  clearPendingOtp,
  readPendingOtp,
  savePendingOtp,
  type PendingOtp,
} from "../helpers/pendingOtp";

/**
 * Two-step login shell: credentials (password → OTP request) then the OTP
 * verification step. Only the pending email and display expiry survive a
 * reload in this tab; neither the password nor the OTP is stored.
 */
export const SignInPage = () => {
  const [pendingOtp, setPendingOtp] = React.useState<PendingOtp | null>(null);
  const [restored, setRestored] = React.useState(false);

  React.useEffect(() => {
    setPendingOtp(readPendingOtp());
    setRestored(true);
  }, []);

  const resetPendingOtp = () => {
    clearPendingOtp();
    setPendingOtp(null);
  };

  // Keep server and initial client markup identical while restoring this tab.
  if (!restored) return null;

  if (pendingOtp) {
    return (
      <OtpVerificationForm
        email={pendingOtp.email}
        onBack={resetPendingOtp}
        onVerified={clearPendingOtp}
      />
    );
  }

  return (
    <SignInForm onOtpRequested={(email) => setPendingOtp(savePendingOtp(email))} />
  );
};
