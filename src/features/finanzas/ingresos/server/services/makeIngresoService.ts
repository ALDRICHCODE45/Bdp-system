import { PrismaClient } from "@prisma/client";
import { PrismaIngresoRepository } from "../repositories/PrismaIngresoRepository.repository";
import { IngresoService } from "./IngresoService.service";
import { makeIngresoHistorialService } from "./makeIngresoHistorialService";

export function makeIngresoService({ prisma }: { prisma: PrismaClient }) {
  const ingresoRepository = new PrismaIngresoRepository(prisma);
  const ingresoHistorialService = makeIngresoHistorialService({ prisma });
  return new IngresoService(
    ingresoRepository,
    ingresoHistorialService,
    prisma
  );
}

