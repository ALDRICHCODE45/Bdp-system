import type { PrismaClient } from "@prisma/client";
import { ReporteHorasService } from "./ReporteHorasService.service";

export function makeReporteHorasService({ prisma }: { prisma: PrismaClient }) {
  return new ReporteHorasService(prisma);
}
