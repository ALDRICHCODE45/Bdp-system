import { PrismaClient } from "@prisma/client";
import { PrismaEmergencyContactRepository } from "../repositories/PrismaEmergencyContactRepository.repository";
import { EmergencyContactService } from "./EmergencyContactService.service";

/**
 * Factory for the EmergencyContactService. Follows the exact wiring pattern
 * used by `makePermissionService` / `makeEmpresaService` / `makeRoleService`:
 *
 *   - takes the shared `prisma` singleton explicitly
 *   - instantiates the Prisma repo once
 *   - hands the repo to the constructor
 *
 * The factory is the only place where the Service is constructed, so any
 * future dependency (current-user resolver, audit logger, etc.) can be
 * injected here without changing call sites.
 */
export function makeEmergencyContactService({
  prisma,
}: {
  prisma: PrismaClient;
}): EmergencyContactService {
  const repository = new PrismaEmergencyContactRepository(prisma);
  return new EmergencyContactService(repository);
}
