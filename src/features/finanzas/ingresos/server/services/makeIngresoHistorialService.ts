import { PrismaClient } from "@prisma/client";
import { PrismaIngresoHistorialRepository } from "../repositories/PrismaIngresoHistorialRepository.repository";
import { IngresoHistorialService } from "./IngresoHistorialService.service";

export function makeIngresoHistorialService({
  prisma,
}: {
  prisma: PrismaClient;
}) {
  const historialRepository = new PrismaIngresoHistorialRepository(prisma);
  return new IngresoHistorialService(historialRepository);
}

