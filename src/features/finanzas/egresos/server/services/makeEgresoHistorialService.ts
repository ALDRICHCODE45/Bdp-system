import { PrismaClient } from "@prisma/client";
import { PrismaEgresoHistorialRepository } from "../repositories/PrismaEgresoHistorialRepository.repository";
import { EgresoHistorialService } from "./EgresoHistorialService.service";

export function makeEgresoHistorialService({
  prisma,
}: {
  prisma: PrismaClient;
}) {
  const historialRepository = new PrismaEgresoHistorialRepository(prisma);
  return new EgresoHistorialService(historialRepository);
}

