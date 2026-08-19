import { PrismaClient } from "@prisma/client";
import { PrismaTarifaAbogadoAsuntoRepository } from "../repositories/PrismaTarifaAbogadoAsuntoRepository.repository";
import { PrismaTarifaAbogadoAsuntoHistorialRepository } from "../repositories/PrismaTarifaAbogadoAsuntoHistorialRepository.repository";
import { TarifaAbogadoAsuntoService } from "./TarifaAbogadoAsuntoService.service";

export function makeTarifaAbogadoAsuntoService({
  prisma,
}: {
  prisma: PrismaClient;
}): TarifaAbogadoAsuntoService {
  const repo = new PrismaTarifaAbogadoAsuntoRepository(prisma);
  const historialRepo = new PrismaTarifaAbogadoAsuntoHistorialRepository(prisma);
  return new TarifaAbogadoAsuntoService(repo, historialRepo, prisma);
}
