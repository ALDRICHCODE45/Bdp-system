import { PrismaClient } from "@prisma/client";
import { PrismaIngresoRepository } from "../repositories/PrismaIngresoRepository.repository";
import { IngresoService } from "./IngresoService.service";

export function makeIngresoService({ prisma }: { prisma: PrismaClient }) {
  const ingresoRepository = new PrismaIngresoRepository(prisma);
  return new IngresoService(ingresoRepository, prisma);
}

