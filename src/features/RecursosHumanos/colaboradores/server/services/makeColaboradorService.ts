import { PrismaClient } from "@prisma/client";
import { PrismaColaboradorRepository } from "../repositories/PrismaColaboradorRepository.repository";
import { ColaboradorService } from "./ColaboradorService.service";

export function makeColaboradorService({ prisma }: { prisma: PrismaClient }) {
  const colaboradorRepository = new PrismaColaboradorRepository(prisma);
  return new ColaboradorService(colaboradorRepository);
}
