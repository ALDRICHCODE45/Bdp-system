import { PrismaClient } from "@prisma/client";
import { PrismaFacturaHistorialRepository } from "../repositories/PrismaFacturaHistorialRepository.repository";
import { FacturaHistorialService } from "./FacturaHistorialService.service";

export function makeFacturaHistorialService({
  prisma,
}: {
  prisma: PrismaClient;
}) {
  const historialRepository = new PrismaFacturaHistorialRepository(prisma);
  return new FacturaHistorialService(historialRepository);
}

