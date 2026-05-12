import type { PrismaClient } from "@prisma/client";
import { DashboardHorasService } from "./DashboardHorasService.service";

export function makeDashboardHorasService({ prisma }: { prisma: PrismaClient }) {
  return new DashboardHorasService(prisma);
}
