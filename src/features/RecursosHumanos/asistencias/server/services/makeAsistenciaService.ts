import { PrismaClient } from "@prisma/client";
import { PrismaAsistenciaRepository } from "../repositories/PrismaAsistenciaRepository.repository";
import { AsistenciaService } from "./AsistenciaService.service";

export const makeAsistenciaService = (deps: { prisma: PrismaClient }) => {
  const asistenciaRepository = new PrismaAsistenciaRepository(deps.prisma);
  return new AsistenciaService(asistenciaRepository);
};
