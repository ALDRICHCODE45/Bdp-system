import { PrismaClient } from "@prisma/client";
import { PrismaColaboradorRepository } from "../repositories/PrismaColaboradorRepository.repository";
import { ColaboradorService } from "./ColaboradorService.service";
import { makeColaboradorHistorialService } from "./makeColaboradorHistorialService";

export function makeColaboradorService({ prisma }: { prisma: PrismaClient }) {
  const colaboradorRepository = new PrismaColaboradorRepository(prisma);
  const historialService = makeColaboradorHistorialService({ prisma });
  return new ColaboradorService(
    colaboradorRepository,
    historialService,
    prisma
  );
}
