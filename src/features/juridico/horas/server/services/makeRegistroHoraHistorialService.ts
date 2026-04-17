import { PrismaClient } from "@prisma/client";
import { PrismaRegistroHoraHistorialRepository } from "../repositories/PrismaRegistroHoraHistorialRepository.repository";
import { RegistroHoraHistorialService } from "./RegistroHoraHistorialService.service";

export function makeRegistroHoraHistorialService({
  prisma,
}: {
  prisma: PrismaClient;
}): RegistroHoraHistorialService {
  const historialRepo = new PrismaRegistroHoraHistorialRepository(prisma);
  return new RegistroHoraHistorialService(historialRepo);
}
