import { PrismaClient } from "@prisma/client";
import { PrismaResponsabilidadCargoRepository } from "../repositories/PrismaResponsabilidadCargoRepository.repository";
import { ResponsabilidadCargoService } from "./ResponsabilidadCargoService.service";

/**
 * Factory for the ResponsabilidadCargoService. Follows the same wiring shape
 * as `makeEmergencyContactService` and the other makeXxxService factories
 * in the colaboradores feature.
 */
export function makeResponsabilidadCargoService({
  prisma,
}: {
  prisma: PrismaClient;
}): ResponsabilidadCargoService {
  const repository = new PrismaResponsabilidadCargoRepository(prisma);
  return new ResponsabilidadCargoService(repository);
}
