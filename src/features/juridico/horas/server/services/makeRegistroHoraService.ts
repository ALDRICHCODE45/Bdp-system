import { PrismaClient } from "@prisma/client";
import { PrismaRegistroHoraRepository } from "../repositories/PrismaRegistroHoraRepository.repository";
import { RegistroHoraService } from "./RegistroHoraService.service";
import { makeRegistroHoraHistorialService } from "./makeRegistroHoraHistorialService";

export function makeRegistroHoraService({
  prisma,
}: {
  prisma: PrismaClient;
}): RegistroHoraService {
  const repo = new PrismaRegistroHoraRepository(prisma);
  const historialService = makeRegistroHoraHistorialService({ prisma });
  return new RegistroHoraService(repo, historialService, prisma);
}
