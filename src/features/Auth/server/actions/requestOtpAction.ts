"use server";

import { headers } from "next/headers";
import prisma from "@/core/lib/prisma";
import { makeOtpService } from "../services/makeOtpService";
import { requestOtpSchema } from "../validators/requestOtpSchema";

export type RequestOtpActionResult =
  { ok: true } | { ok: false; error: string };

/**
 * Step 1 of the OTP login: validate the password and email a single-use code.
 * Intentionally returns a generic error for every rejection path.
 */
export const requestOtpAction = async (
  input: unknown,
): Promise<RequestOtpActionResult> => {
  const parsed = requestOtpSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "Solicitud inválida." };
  }

  const service = makeOtpService({ prisma });
  const result = await service.requestOtp({
    ...parsed.data,
    clientKey: await resolveClientKey(),
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  return { ok: true };
};

async function resolveClientKey(): Promise<string> {
  // NOTE: x-forwarded-for trust depends on the deploy proxy being the sole
  // ingress, matching the assumption documented in the NextAuth authorize flow.
  const headerList = await headers();

  return (
    headerList.get("x-forwarded-for")?.split(",")[0] ??
    headerList.get("x-real-ip") ??
    "unknown"
  ).trim();
}
