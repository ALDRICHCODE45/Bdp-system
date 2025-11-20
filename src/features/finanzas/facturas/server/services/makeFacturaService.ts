import { PrismaClient } from "@prisma/client";
import { PrismaFacturaRepository } from "../repositories/PrismaFacturaRepository.repository";
import { FacturaService } from "./FacturaService.service";

export function makeFacturaService({ prisma }: { prisma: PrismaClient }) {
  const facturaRepository = new PrismaFacturaRepository(prisma);
  return new FacturaService(facturaRepository, prisma);
}

