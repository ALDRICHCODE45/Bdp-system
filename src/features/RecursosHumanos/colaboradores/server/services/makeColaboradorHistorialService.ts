import { PrismaClient } from "@prisma/client";
import { PrismaColaboradorHistorialRepository } from "../repositories/PrismaColaboradorHistorialRepository.repository";
import { ColaboradorHistorialService } from "./ColaboradorHistorialService.service";

export function makeColaboradorHistorialService({
  prisma,
}: {
  prisma: PrismaClient;
}) {
  const historialRepository = new PrismaColaboradorHistorialRepository(prisma);
  return new ColaboradorHistorialService(historialRepository);
}

