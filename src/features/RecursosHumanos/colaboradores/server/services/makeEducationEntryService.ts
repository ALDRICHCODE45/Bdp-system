import { PrismaClient } from "@prisma/client";
import { PrismaEducationEntryRepository } from "../repositories/PrismaEducationEntryRepository.repository";
import { EducationEntryService } from "./EducationEntryService.service";

/**
 * Factory for the EducationEntryService. Follows the same wiring shape used
 * by `makeSalaryHistoryService` / `makePositionHistoryService`:
 *
 *   - takes the shared `prisma` singleton explicitly
 *   - instantiates the Prisma repo once
 *   - hands the repo + prisma to the constructor (the prisma client is
 *     needed by the service to open `$transaction` blocks for reorder)
 *
 * The factory is the only place where the Service is constructed, so any
 * future dependency (e.g. audit logger) can be injected here without
 * changing call sites.
 */
export function makeEducationEntryService({
  prisma,
}: {
  prisma: PrismaClient;
}): EducationEntryService {
  const repository = new PrismaEducationEntryRepository(prisma);
  return new EducationEntryService(repository, prisma);
}