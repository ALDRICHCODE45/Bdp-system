import type { PrismaClient } from "@prisma/client";
import { PrismaMovimientoRepository } from "../repositories/PrismaMovimientoRepository.repository";
import { PrismaMovimientoHistorialRepository } from "../repositories/PrismaMovimientoHistorialRepository.repository";
import { MovimientoService } from "./MovimientoService.service";

export function makeMovimientoService({
  prisma,
}: {
  prisma: PrismaClient;
}): MovimientoService {
  const repo = new PrismaMovimientoRepository(prisma);
  const historialRepo = new PrismaMovimientoHistorialRepository(prisma);
  return new MovimientoService(repo, historialRepo, prisma);
}
