import { PrismaClient } from "@prisma/client";
import { PrismaSocioRepository } from "../repositories/PrismaSocioRepository.repository";
import { SocioService } from "./SocioService.service";

export function makeSocioService({ prisma }: { prisma: PrismaClient }) {
  const socioRepository = new PrismaSocioRepository(prisma);
  return new SocioService(socioRepository);
}
