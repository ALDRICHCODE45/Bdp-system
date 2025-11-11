import { PrismaClient } from "@prisma/client";
import { PrismaEntradasSalidasRepository } from "../repositories/PrismaEntradasSalidasRespository.repository";
import { EntradasSalidasService } from "./EntradasSalidasService.service";

export function makeEntradasSalidasService({
  prisma,
}: {
  prisma: PrismaClient;
}) {
  const serviceRepository = new PrismaEntradasSalidasRepository(prisma);
  return new EntradasSalidasService(serviceRepository);
}
