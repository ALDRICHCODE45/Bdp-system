import type { PrismaClient } from "@prisma/client";
import { PrismaOtpChallengeRepository } from "../repositories/PrismaOtpChallengeRepository.repository";
import { PrismaUserRepository } from "@/features/sistema/usuarios/server/repositories/PrismaUserRepository.repository";
import { BcryptPasswordHasher } from "@/core/shared/security/hasher";
import { sendEmail } from "@/core/lib/email/email";
import {
  generateOtpCodigoEmail,
  generateOtpCodigoPlainText,
} from "@/core/lib/email/templates/otpCodigoTemplate";
import { OtpService, type OtpDelivery } from "./OtpService.service";

/**
 * Production OTP delivery over SMTP. Throws on transport failure; the service
 * catches it and fails closed by revoking the challenge.
 */
const deliverOtp: OtpDelivery = async ({
  to,
  name,
  code,
  expiresInMinutes,
}) => {
  const data = {
    nombre: name,
    codigo: code,
    expiraEnMinutos: expiresInMinutes,
  };

  await sendEmail({
    to,
    subject: "Tu código de verificación — BDP System",
    html: generateOtpCodigoEmail(data),
    text: generateOtpCodigoPlainText(data),
  });
};

export const makeOtpService = (deps: { prisma: PrismaClient }) => {
  const otpRepository = new PrismaOtpChallengeRepository(deps.prisma);
  const userRepository = new PrismaUserRepository(deps.prisma);
  const passwordHasher = new BcryptPasswordHasher();

  return new OtpService(
    otpRepository,
    userRepository,
    passwordHasher,
    deliverOtp,
  );
};
