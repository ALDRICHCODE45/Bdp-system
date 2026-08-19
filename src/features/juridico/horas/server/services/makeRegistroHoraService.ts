import type { PrismaClient } from "@prisma/client";
import { PrismaRegistroHoraRepository } from "../repositories/PrismaRegistroHoraRepository.repository";
import { RegistroHoraService } from "./RegistroHoraService.service";
import { makeRegistroHoraHistorialService } from "./makeRegistroHoraHistorialService";
import { PrismaTarifaAbogadoAsuntoRepository } from "@/features/juridico/tarifas/server/repositories/PrismaTarifaAbogadoAsuntoRepository.repository";

export function makeRegistroHoraService({
  prisma,
}: {
  prisma: PrismaClient;
}): RegistroHoraService {
  const repo = new PrismaRegistroHoraRepository(prisma);
  const historialService = makeRegistroHoraHistorialService({ prisma });
  const tarifaRepo = new PrismaTarifaAbogadoAsuntoRepository(prisma);
  return new RegistroHoraService(repo, historialService, tarifaRepo, prisma);
}
