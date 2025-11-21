import { PrismaClient } from "@prisma/client";
import { PrismaEgresoRepository } from "../repositories/PrismaEgresoRepository.repository";
import { EgresoService } from "./EgresoService.service";
import { makeEgresoHistorialService } from "./makeEgresoHistorialService";

export function makeEgresoService({ prisma }: { prisma: PrismaClient }) {
  const egresoRepository = new PrismaEgresoRepository(prisma);
  const historialService = makeEgresoHistorialService({ prisma });
  return new EgresoService(egresoRepository, historialService, prisma);
}

