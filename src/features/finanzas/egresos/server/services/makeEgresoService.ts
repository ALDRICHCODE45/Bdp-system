import { PrismaClient } from "@prisma/client";
import { PrismaEgresoRepository } from "../repositories/PrismaEgresoRepository.repository";
import { EgresoService } from "./EgresoService.service";

export function makeEgresoService({ prisma }: { prisma: PrismaClient }) {
  const egresoRepository = new PrismaEgresoRepository(prisma);
  return new EgresoService(egresoRepository, prisma);
}

