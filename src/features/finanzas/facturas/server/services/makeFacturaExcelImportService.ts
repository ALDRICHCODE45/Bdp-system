import { PrismaClient } from "@prisma/client";
import { PrismaFacturaRepository } from "../repositories/PrismaFacturaRepository.repository";
import { FacturaExcelImportService } from "./FacturaExcelImportService.service";
import { makeFacturaHistorialService } from "./makeFacturaHistorialService";

export function makeFacturaExcelImportService({ prisma }: { prisma: PrismaClient }) {
  const facturaRepository = new PrismaFacturaRepository(prisma);
  const facturaHistorialService = makeFacturaHistorialService({ prisma });
  return new FacturaExcelImportService(
    facturaRepository,
    facturaHistorialService,
    prisma
  );
}
