import { PrismaClient } from "@prisma/client";
import { PrismaFacturaRepository } from "../repositories/PrismaFacturaRepository.repository";
import { FacturaService } from "./FacturaService.service";
import { makeFacturaHistorialService } from "./makeFacturaHistorialService";

export function makeFacturaService({ prisma }: { prisma: PrismaClient }) {
  const facturaRepository = new PrismaFacturaRepository(prisma);
  const facturaHistorialService = makeFacturaHistorialService({ prisma });
  return new FacturaService(
    facturaRepository,
    facturaHistorialService,
    prisma
  );
}

