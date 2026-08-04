import type { PrismaClient } from "@prisma/client";
import { PrismaReporteHorasAgrupadoRepository } from "../repositories/PrismaReporteHorasAgrupadoRepository.repository";
import { ReporteHorasAgrupadoService } from "./ReporteHorasAgrupadoService.service";

export function makeReporteHorasAgrupadoService({
  prisma,
}: {
  prisma: PrismaClient;
}) {
  const repo = new PrismaReporteHorasAgrupadoRepository(prisma);
  return new ReporteHorasAgrupadoService(repo);
}
