"use server";

import { headers } from "next/headers";
import prisma from "@/core/lib/prisma";
import { makeOtpService } from "../services/makeOtpService";
import { verifyOtpSchema } from "../validators/verifyOtpSchema";

export type VerifyOtpActionResult =
  | { ok: true; data: { userId: string; email: string } }
  | { ok: false; error: string };

/**
 * Step 2 of the OTP login: consume the emailed code. Session issuance stays in
 * NextAuth (OTP-3); this action only proves the challenge was verified.
 */
export const verifyOtpAction = async (
  input: unknown,
): Promise<VerifyOtpActionResult> => {
  const parsed = verifyOtpSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "El código es inválido o expiró." };
  }

  const service = makeOtpService({ prisma });
  const result = await service.verifyOtp({
    ...parsed.data,
    clientKey: await resolveClientKey(),
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  return { ok: true, data: result.value };
};

async function resolveClientKey(): Promise<string> {
  // NOTE: x-forwarded-for trust depends on the deploy proxy being the sole
  // ingress, matching the assumption documented in requestOtpAction and the
  // NextAuth authorize flow. Per-client throttling is also per-process; see
  // the deployment-dependency note in @/core/shared/security/rate-limit.
  const headerList = await headers();

  return (
    headerList.get("x-forwarded-for")?.split(",")[0] ??
    headerList.get("x-real-ip") ??
    "unknown"
  ).trim();
}
